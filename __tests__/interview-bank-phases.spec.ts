import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  interviewQuestionBankSchema,
  interviewTrickyQuizSchema
} from '../src/schemas/interview-questions';
import { learningPlanSchema } from '../src/schemas/learning-plan';

const dir = path.resolve('src', 'content', 'interview-questions');
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));

function loadBank(name: string) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const parsed = interviewQuestionBankSchema.safeParse(raw);
  expect(parsed.success).toBe(true);
  return parsed.success ? parsed.data : null;
}

function loadQuiz(name: string) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const parsed = interviewTrickyQuizSchema.safeParse(raw);
  expect(parsed.success).toBe(true);
  return parsed.success ? parsed.data : null;
}

const PLAN_PHASE_AREAS = ['python-backend-cloud', 'llm-fundamentals', 'rag-retrieval', 'agents-mcp', 'evals-production'];
const FRONTEND_AREAS = [
  'architecture-build',
  'backend-data',
  'behavioral-career',
  'browser-web-apis',
  'dsa-frontend',
  'git-cicd-cloud',
  'html-css-accessibility',
  'javascript-typescript',
  'mobile-cross-platform',
  'networking-apis',
  'observability',
  'react-frameworks-ui',
  'security-auth',
  'state-data-fetching',
  'styling-design-systems',
  'system-design-frontend',
  'testing-quality',
  'ui-components-machine-coding',
  'web-performance'
];

test.describe('Banco reorganizado por fases del plan (ADR-0030)', () => {
  test('las areas nuevas son 1:1 con las fases del plan', () => {
    const planRaw = JSON.parse(
      fs.readFileSync(path.resolve('src', 'content', 'learning-plan.example.json'), 'utf8')
    );
    const plan = learningPlanSchema.safeParse(planRaw);
    expect(plan.success).toBe(true);
    if (!plan.success) return;

    const phaseAreas = plan.data.phases
      .map((phase) => phase.interviewArea)
      .filter((area): area is string => Boolean(area))
      .sort();
    expect(phaseAreas).toEqual([...PLAN_PHASE_AREAS].sort());

    for (const area of PLAN_PHASE_AREAS) {
      expect(files).toContain(`${area}.json`);
      expect(files).toContain(`${area}.tricky-quiz.json`);
    }
  });

  test('las preguntas reubicadas conservan su id con prefijo historico', () => {
    const moved = [
      'ai-agents-what-is-an-llm',
      'ai-agents-rag-pipeline-and-failure-modes',
      'ai-agents-mcp-architecture',
      'ai-agents-evals-and-regression-testing',
      'ai-agents-prompt-injection-defense'
    ];
    const allIds = new Set(
      files
        .filter((file) => !file.endsWith('.tricky-quiz.json'))
        .flatMap((file) => (loadBank(file)?.questions ?? []).map((question) => question.id))
    );
    for (const id of moved) {
      expect(allIds.has(id)).toBe(true);
    }
  });

  test('las areas de frontend del banco siguen existiendo sin cambios de taxonomia', () => {
    for (const area of FRONTEND_AREAS) {
      const bank = loadBank(`${area}.json`);
      expect(bank, `missing bank ${area}`).not.toBeNull();
      expect(bank?.area).toBe(area);
    }
    expect(files.filter((file) => !file.endsWith('.tricky-quiz.json'))).toHaveLength(24);
  });

  test('cada area de fase tiene preguntas nuevas citadas y tricky y quiz por fase', () => {
    for (const area of PLAN_PHASE_AREAS) {
      const bank = loadBank(`${area}.json`);
      const quiz = loadQuiz(`${area}.tricky-quiz.json`);
      expect(bank).not.toBeNull();
      expect(quiz).not.toBeNull();
      if (!bank || !quiz) continue;

      expect(bank.questions.length).toBeGreaterThanOrEqual(4);
      for (const question of bank.questions) {
        expect(question.sources.length).toBeGreaterThanOrEqual(1);
        expect(question.sources.length).toBeLessThanOrEqual(3);
        for (const source of question.sources) {
          expect(source.url).toMatch(/^https?:\/\//);
        }
      }

      expect(quiz.quiz.mcqs.length).toBeGreaterThanOrEqual(10);
      expect(quiz.quiz.scenarios.length).toBeGreaterThanOrEqual(3);

      const bankIds = new Set(bank.questions.map((question) => question.id));
      for (const group of quiz.trickies) {
        expect(bankIds.has(group.id)).toBe(true);
      }
    }
  });

  test('los temas prioritarios de la reevaluacion estan cubiertos por preguntas nuevas', () => {
    const texts = PLAN_PHASE_AREAS.flatMap((area) =>
      (loadBank(`${area}.json`)?.questions ?? []).map(
        (question) => `${question.id} ${question.question.en}`
      )
    ).join('\n');
    expect(texts).toContain('error analysis');
    expect(texts).toContain('NOT use RAG');
    expect(texts).toContain('token cost and latency');
    expect(texts).toContain('exfiltrating data');
    expect(texts).toContain('AI coding agents');
  });
});
