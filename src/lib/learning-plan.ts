import fs from 'node:fs';
import path from 'node:path';
import { learningPlanSchema, type LearningPlan } from '../schemas/learning-plan';

export type LearningPlanSource = 'local' | 'example';

export interface LoadedLearningPlan {
  plan: LearningPlan;
  source: LearningPlanSource;
}

export interface LoadLearningPlanOptions {
  forceExample?: boolean;
}

export const LOCAL_PLAN_FILE = 'learning-plan.json';
export const EXAMPLE_PLAN_FILE = 'learning-plan.example.json';

function defaultContentDir(): string {
  return path.resolve('src', 'content');
}

function readPlanFile(file: string): LearningPlan {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parsed = learningPlanSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `${path.basename(file)} failed learning plan validation:\n` +
        JSON.stringify(parsed.error.issues, null, 2)
    );
  }
  return parsed.data;
}

export function loadLearningPlan(
  contentDir: string = defaultContentDir(),
  options: LoadLearningPlanOptions = {}
): LoadedLearningPlan {
  const forceExample = options.forceExample ?? process.env.PLAN_SOURCE === 'example';
  const localFile = path.join(contentDir, LOCAL_PLAN_FILE);
  const exampleFile = path.join(contentDir, EXAMPLE_PLAN_FILE);

  if (!forceExample && fs.existsSync(localFile)) {
    return { plan: readPlanFile(localFile), source: 'local' };
  }
  if (!fs.existsSync(exampleFile)) {
    throw new Error(`No learning plan found: neither ${localFile} nor ${exampleFile} exists`);
  }
  return { plan: readPlanFile(exampleFile), source: 'example' };
}
