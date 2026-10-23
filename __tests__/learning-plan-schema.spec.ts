import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { learningPlanSchema } from '../src/schemas/learning-plan';
import { loadLearningPlan } from '../src/lib/learning-plan';

const exampleFile = path.resolve('src', 'content', 'learning-plan.example.json');
const examplePlan = JSON.parse(fs.readFileSync(exampleFile, 'utf8'));

function clone() {
  return JSON.parse(JSON.stringify(examplePlan));
}

function issuesOf(result: ReturnType<typeof learningPlanSchema.safeParse>): string[] {
  if (result.success) return [];
  return result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

test.describe('Learning plan schema', () => {
  test('the example plan validates and covers the seven phases of the study plan', () => {
    const result = learningPlanSchema.safeParse(examplePlan);
    expect(issuesOf(result)).toEqual([]);
    if (!result.success) return;
    expect(result.data.version).toBe(1);
    expect(result.data.phases).toHaveLength(7);
    expect(result.data.phases.map((phase) => phase.order)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.data.roles.length).toBeGreaterThanOrEqual(3);
  });

  test('every phase carries a gate and at least one resource, and roles are enabled', () => {
    const result = learningPlanSchema.safeParse(examplePlan);
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const phase of result.data.phases) {
      expect(phase.gate.es.length).toBeGreaterThan(0);
      expect(phase.gate.en.length).toBeGreaterThan(0);
      expect(phase.resourceIds.length).toBeGreaterThan(0);
    }
    const enablingPhases = result.data.phases.filter((phase) => phase.enablesRoles.length > 0);
    expect(enablingPhases.length).toBeGreaterThan(0);
  });

  test('resources and phases only reference existing skill ids', () => {
    const broken = clone();
    broken.resources[0].skillIds.push('not-a-skill');
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('Unknown skill id "not-a-skill"');
  });

  test('a phase pointing at an unknown resource id fails validation', () => {
    const broken = clone();
    broken.phases[1].resourceIds.push('not-a-resource');
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('Unknown resource id "not-a-resource"');
  });

  test('a phase pointing at an unknown role id fails validation', () => {
    const broken = clone();
    broken.phases[1].enablesRoles.push('not-a-role');
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('Unknown role id "not-a-role"');
  });

  test('phase orders with gaps fail validation', () => {
    const broken = clone();
    broken.phases[2].order = 9;
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('without gaps');
  });

  test('duplicate resource ids fail validation', () => {
    const broken = clone();
    broken.resources[1].id = broken.resources[0].id;
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('Duplicate resource id');
  });

  test('a localized text field without both locales fails validation', () => {
    const broken = clone();
    broken.title = { es: 'Solo espanol' };
    const result = learningPlanSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(issuesOf(result).join('\n')).toContain('title');
  });

  test('the example seed keeps demand on skills with source and date, never on resources', () => {
    const result = learningPlanSchema.safeParse(examplePlan);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const demanded = result.data.skills.filter((skill) => skill.demand);
    expect(demanded.length).toBeGreaterThan(10);
    for (const skill of demanded) {
      expect(skill.demand?.source.length).toBeGreaterThan(0);
      expect(skill.demand?.asOf.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Learning plan loader', () => {
  test('falls back to the example plan when there is no local plan', () => {
    const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learning-plan-'));
    fs.copyFileSync(exampleFile, path.join(contentDir, 'learning-plan.example.json'));
    const loaded = loadLearningPlan(contentDir);
    expect(loaded.source).toBe('example');
    expect(loaded.plan.id).toBe('ai-applied-entry-2026');
  });

  test('prefers the local plan and fails loudly when it is invalid', () => {
    const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learning-plan-'));
    fs.copyFileSync(exampleFile, path.join(contentDir, 'learning-plan.example.json'));
    const local = clone();
    local.id = 'my-plan';
    fs.writeFileSync(path.join(contentDir, 'learning-plan.json'), JSON.stringify(local));
    const loaded = loadLearningPlan(contentDir);
    expect(loaded.source).toBe('local');
    expect(loaded.plan.id).toBe('my-plan');

    fs.writeFileSync(path.join(contentDir, 'learning-plan.json'), JSON.stringify({ version: 1 }));
    expect(() => loadLearningPlan(contentDir)).toThrow(/failed learning plan validation/);
  });
});

test.describe('Gate evidence del plan (ADR-0041)', () => {
  test('the example plan cites one verifiable pointer per evidence type on the RAG phase', () => {
    const result = learningPlanSchema.safeParse(examplePlan);
    expect(issuesOf(result)).toEqual([]);
    if (!result.success) return;
    const phase = result.data.phases.find((item) => item.id === 'fase-3-rag');
    expect(phase?.gateEvidence?.map((item) => item.type)).toEqual(['commit', 'url', 'file']);
    for (const item of phase?.gateEvidence ?? []) {
      expect(item.ref.length).toBeGreaterThan(0);
      expect(item.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.source.length).toBeGreaterThan(0);
      expect(item.label.es.length).toBeGreaterThan(0);
      expect(item.label.en.length).toBeGreaterThan(0);
    }
  });

  test('phases without gateEvidence keep validating (cambio aditivo)', () => {
    const plan = clone();
    for (const phase of plan.phases) delete phase.gateEvidence;
    expect(issuesOf(learningPlanSchema.safeParse(plan))).toEqual([]);
  });

  test('evidence without a verifiable pointer, with a bad type or a bad date is rejected', () => {
    const emptyRef = clone();
    emptyRef.phases[3].gateEvidence[0].ref = '';
    expect(issuesOf(learningPlanSchema.safeParse(emptyRef)).join(' ')).toContain('gateEvidence');

    const badType = clone();
    badType.phases[3].gateEvidence[0].type = 'screenshot';
    expect(issuesOf(learningPlanSchema.safeParse(badType)).length).toBeGreaterThan(0);

    const badDate = clone();
    badDate.phases[3].gateEvidence[0].asOf = 'ayer';
    expect(issuesOf(learningPlanSchema.safeParse(badDate)).length).toBeGreaterThan(0);
  });

  test('the contract carries no invented state: evidence has no done flag', () => {
    const result = learningPlanSchema.safeParse(examplePlan);
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const phase of result.data.phases) {
      for (const item of phase.gateEvidence ?? []) {
        expect(item).not.toHaveProperty('done');
        expect(item).not.toHaveProperty('status');
      }
    }
  });
});
