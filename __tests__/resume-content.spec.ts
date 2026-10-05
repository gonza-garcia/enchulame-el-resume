import { test, expect } from '@playwright/test';

const EN = 'article.lang[data-lang="en"][data-positioning="frontend"]';
const ES = 'article.lang[data-lang="es"][data-positioning="frontend"]';

test.describe('Resume content sanity (demo fixtures)', () => {
  test('name is rendered in both locales', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${EN} h1`)).toHaveText('Ariana Montiel');
    await expect(page.locator(`${ES} h1`)).toHaveText('Ariana Montiel');
  });

  test('Professional Summary renders as 4 <p> elements (one per paragraph)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${EN} .summary p`)).toHaveCount(4);
    await expect(page.locator(`${ES} .summary p`)).toHaveCount(4);
  });

  test('dates localize per locale (Apr 2021 / Abr 2021)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(EN)).toContainText('Apr 2021');
    await page.click('#btn-es');
    await expect(page.locator(ES)).toContainText('Abr 2021');
  });

  test('work experience renders the demo companies and projects', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(EN)).toContainText('Aeronix Logistics');
    await expect(page.locator(EN)).toContainText('Solmar Retail Tech');
    await expect(page.locator(EN)).toContainText('Freightline Control (cargo operations console)');
    await expect(page.locator(EN)).toContainText('Modernized Aeronix');
  });

  test('the active positioning selects and orders the bullets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(EN)).toContainText('Raised test coverage with Vitest');
    await page.locator('button[data-positioning="ai"]').click();
    const ai = page.locator('article.lang[data-lang="en"][data-positioning="ai"]');
    await expect(ai).toBeVisible();
    await expect(ai).toContainText('Adopted AI agentic development');
    await expect(ai).toContainText('Wrote prompts and workflow guides');
    await expect(ai).not.toContainText('two-week sprints');

    const text = (await ai.textContent()) ?? '';
    const aiBullet = text.indexOf('Adopted AI agentic development');
    const firstBullet = text.indexOf('Modernized Aeronix');
    expect(aiBullet).toBeGreaterThan(-1);
    expect(firstBullet).toBeGreaterThan(-1);
    expect(aiBullet).toBeLessThan(firstBullet);
  });

  test('the AI positioning drops the work projects without selected bullets', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[data-positioning="ai"]').click();
    const ai = page.locator('article.lang[data-lang="en"][data-positioning="ai"]');
    await expect(ai).toContainText('Aeronix Logistics');
    await expect(ai).not.toContainText('Solmar Retail Tech');
  });

  test('skills render grouped by category with evidence in parentheses', async ({ page }) => {
    await page.goto('/');
    const skills = page.locator(`${EN} .skills`);
    await expect(skills).toContainText('Frontend');
    await expect(skills).toContainText(
      'React (versions 18 and 19, with a shared design system across two teams)'
    );
    await expect(skills).toContainText('Playwright (E2E suite on a personal project)');
  });

  test('languages render as their own skill line', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${EN} .skills`)).toContainText('Languages');
    await expect(page.locator(`${EN} .skills`)).toContainText(
      'English (Advanced, more than 3 years of daily communication with US-based teams)'
    );
    await page.click('#btn-es');
    await expect(page.locator(`${ES} .skills`)).toContainText('Idiomas');
  });

  test('Personal Projects section renders the demo projects with their URL', async ({ page }) => {
    await page.goto('/');
    const section = page.locator(`${EN} section[aria-label="Personal Projects"]`);
    await expect(section).toHaveCount(1);
    await expect(section).toContainText('Kitchen Stock (pantry tracker)');
    const first = section.locator('.proj-entry').filter({ hasText: 'Kitchen Stock (pantry tracker)' });
    await expect(first.locator('.proj-meta')).toContainText('https://example.com/kitchen-stock');
  });

  test('demo content never renders real contact data', async ({ page }) => {
    await page.goto('/');
    const text = ((await page.locator('main.page').textContent()) ?? '').toLowerCase();
    expect(text).toContain('example.com');
    expect(text).not.toContain('gmail.com');
    expect(text).not.toContain('hotmail.com');
    expect(text).not.toContain('outlook.com');
  });
});
