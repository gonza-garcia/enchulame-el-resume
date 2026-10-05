import { test, expect } from '@playwright/test';

const EN = 'article.lang[data-lang="en"][data-positioning="frontend"]';
const ES = 'article.lang[data-lang="es"][data-positioning="frontend"]';

test.describe('Language toggle (EN/ES)', () => {
  test('starts in EN by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-en')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#btn-es')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator(EN)).toBeVisible();
    await expect(page.locator(ES)).toBeHidden();
  });

  test('clicking ES switches visible article', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-es');
    await expect(page.locator('#btn-es')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#btn-en')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator(ES)).toBeVisible();
    await expect(page.locator(EN)).toBeHidden();
  });

  test('ES article renders the localized content', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-es');
    await expect(page.locator(ES)).toContainText('Abr 2021');
    await expect(page.locator(ES)).toContainText('Modernicé la consola');
  });

  test('EN article renders the English content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(EN)).toContainText('Apr 2021');
    await expect(page.locator(EN)).toContainText('Modernized Aeronix');
  });

  test('persists language choice across reloads via localStorage', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-es');
    await page.reload();
    await expect(page.locator('#btn-es')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(ES)).toBeVisible();
  });

  test('the positioning choice survives reloads and keeps the language', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[data-positioning="ai"]').click();
    await page.click('#btn-es');
    await page.reload();
    await expect(page.locator('button[data-positioning="ai"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('article.lang[data-lang="es"][data-positioning="ai"]')).toBeVisible();
  });
});
