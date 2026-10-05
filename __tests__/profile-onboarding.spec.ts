import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { profileSchema } from '../src/schemas/profile';
import { loadProfile, LOCAL_PROFILE_FILE } from '../src/lib/profile';
import { projectProfile } from '../src/lib/profile-projection';

const fixtureFile = path.resolve('__tests__', 'fixtures', 'profile-interview-output.json');
const fixtureRaw = fs.readFileSync(fixtureFile, 'utf8');
const fixture = JSON.parse(fixtureRaw);

function issuesOf(result: ReturnType<typeof profileSchema.safeParse>): string[] {
  if (result.success) return [];
  return result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

test.describe('Onboarding flow output (interview fixture)', () => {
  test('the interview output validates against the profile schema', () => {
    const result = profileSchema.safeParse(fixture);
    expect(issuesOf(result)).toEqual([]);
  });

  test('the interview covers the two v1 positionings and both locales', () => {
    const result = profileSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.positionings.map((positioning) => positioning.id)).toEqual(['frontend', 'ai']);
    for (const positioning of result.data.positionings) {
      expect(positioning.title.es.length).toBeGreaterThan(0);
      expect(positioning.title.en.length).toBeGreaterThan(0);
      expect(positioning.summary.es.length).toBeGreaterThan(0);
      expect(positioning.summary.en.length).toBeGreaterThan(0);
      expect(positioning.skillIds.length).toBeGreaterThan(0);
      expect(positioning.bulletIds.length).toBeGreaterThan(0);
    }
  });

  test('experience bullets and personal projects carry skillIds for /learning', () => {
    const result = profileSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const bulletSkillIds = result.data.facts.experience.flatMap((job) =>
      job.projects.flatMap((project) => project.bullets.map((bullet) => bullet.skillIds ?? []))
    );
    expect(bulletSkillIds.some((skillIds) => skillIds.length > 0)).toBe(true);
    expect(result.data.facts.projects.some((project) => (project.skillIds ?? []).length > 0)).toBe(true);
  });

  test('the saved output is src/content/profile.json and the loader consumes it', async () => {
    expect(LOCAL_PROFILE_FILE).toBe('profile.json');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-onboarding-'));
    try {
      fs.writeFileSync(path.join(dir, LOCAL_PROFILE_FILE), fixtureRaw);
      const loaded = loadProfile(dir);
      expect(loaded.source).toBe('local');
      expect(loaded.profile.identity.name.en).toBe('Micaela Roldan');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the build projection renders the flow output in both positionings and locales', () => {
    const profile = profileSchema.parse(fixture);

    const frontend = projectProfile(profile, 'frontend', 'en');
    expect(frontend.name).toBe('Micaela Roldan');
    expect(frontend.title).toBe('Frontend Developer');
    const frontendBullets = frontend.experience[0].projects[0].bullets;
    expect(frontendBullets[0]).toBe(
      "Built Nubalia's payment dashboard, a React app with clear loading states and merchant filters."
    );
    expect(frontendBullets.join('\n')).not.toContain('Adopted AI agentic development');

    const ai = projectProfile(profile, 'ai', 'es');
    expect(ai.title).toBe('AI Developer');
    expect(ai.summary).toBe(fixture.positionings[1].summary.es);
    const aiBullets = ai.experience[0].projects[0].bullets;
    expect(aiBullets[0]).toBe(
      'Adopté el desarrollo con agentes de IA para investigar, implementar y revisar cambios, con tests y revisión humana en cada entrega.'
    );
    expect(aiBullets.join('\n')).not.toContain('Audité y corregí accesibilidad');
    expect(ai.skills.length).toBeGreaterThan(0);
  });
});
