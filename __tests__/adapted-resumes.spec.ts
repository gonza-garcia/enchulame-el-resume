import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resumeSchema } from '../src/schemas/resume';

const offersDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'docs', 'job-offers');

test.describe('Adapted resumes en disco', () => {
  const slugs = fs
    .readdirSync(offersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const slug of slugs) {
    const file = path.join(offersDir, slug, 'adapted-resume.json');
    if (!fs.existsSync(file)) continue;

    test(`${slug} valida contra el schema del CV`, () => {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const result = resumeSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error(`${slug}: ${JSON.stringify(result.error.issues.slice(0, 5))}`);
      }
      const esBullets = parsed.es.experience[0].projects[0].bullets;
      const enBullets = parsed.en.experience[0].projects[0].bullets;
      expect(esBullets.length).toBeGreaterThan(0);
      expect(esBullets.length).toBe(enBullets.length);
    });
  }
});
