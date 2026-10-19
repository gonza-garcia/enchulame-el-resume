import { test, expect } from '@playwright/test';
import fs from 'node:fs';

async function downloadJson(page: import('@playwright/test').Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.click('#btn-export');
  await page.click('[data-export="json"]');
  const download = await downloadPromise;
  const file = await download.path();
  expect(download.suggestedFilename()).toBe('resume.json');
  return JSON.parse(fs.readFileSync(file!, 'utf8'));
}

test.describe('Export dropdown', () => {
  test('dropdown is closed by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-export')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.export-menu')).toBeHidden();
  });

  test('clicking "Export to" opens the menu', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-export');
    await expect(page.locator('#btn-export')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.export-menu')).toBeVisible();
    await expect(page.locator('[data-export="pdf"]')).toBeVisible();
    await expect(page.locator('[data-export="docx"]')).toBeVisible();
    await expect(page.locator('[data-export="json"]')).toBeVisible();
    await expect(page.locator('[data-export="linkedin"]')).toBeVisible();
  });

  test('clicking outside closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-export');
    await expect(page.locator('.export-menu')).toBeVisible();
    await page.click('body', { position: { x: 5, y: 5 } }).catch(() => {});
    await expect(page.locator('#btn-export')).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape key closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-export');
    await expect(page.locator('.export-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btn-export')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking LinkedIn Sections item opens the modal', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-export');
    await page.click('[data-export="linkedin"]');
    await expect(page.locator('#linkedin-modal')).toHaveClass(/open/);
    await expect(page.locator('#linkedin-output')).toBeVisible();
  });

  test('JSON export downloads the active projection (EN by default)', async ({ page }) => {
    await page.goto('/');
    const projection = await downloadJson(page);
    expect(projection.name).toBe('Ariana Montiel');
    expect(projection.title).toBe('Frontend Developer');
    expect(projection.summary).toContain('logistics and retail');
    expect(projection).not.toHaveProperty('es');
    expect(projection).not.toHaveProperty('en');
  });

  test('JSON export follows the language toggle', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-es');
    const projection = await downloadJson(page);
    expect(projection.title).toBe('Frontend Developer');
    expect(projection.summary).toContain('equipos de logística y retail');
    expect(projection.experience[0].startDate).toBe('Abr 2021');
  });

  test('JSON export follows the active positioning', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[data-positioning="ai"]').click();
    const projection = await downloadJson(page);
    expect(projection.title).toBe('AI Developer');
    expect(projection.summary).toContain('focus on AI');
    expect(projection.experience.map((job: { company: string }) => job.company)).toEqual([
      'Aeronix Logistics'
    ]);
  });

  test('DOCX export downloads the active projection as .docx', async ({ page }) => {
    await page.goto('/');
    const downloadPromise = page.waitForEvent('download');
    await page.click('#btn-export');
    await page.click('[data-export="docx"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.docx$/);
    // ADR-0036: nombre neutro (apellidos primero), sin datos de la oferta.
    expect(download.suggestedFilename()).toContain('Montiel Ariana');
    const file = await download.path();
    expect(fs.statSync(file!).size).toBeGreaterThan(0);
  });
});
