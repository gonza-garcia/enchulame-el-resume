import { test, expect } from '@playwright/test';

test.describe('Perfil frente al plan en /learning', () => {
  test('muestra cubiertas con nivel, gaps con sugerencias y skills fuera del plan', async ({
    page
  }) => {
    await page.goto('/learning/');
    const panel = page.locator('.learning-profile-plan');
    await expect(panel).toBeVisible();

    const covered = panel.locator('.learning-profile-grid > div').nth(0);
    await expect(covered.locator('li')).toHaveCount(3);
    await expect(covered).toContainText('Python');
    await expect(covered).toContainText('Basic');

    const gaps = panel.locator('.learning-profile-grid > div').nth(1);
    await expect(gaps.locator('li')).toHaveCount(16);
    await expect(gaps).toContainText('RAG');
    await expect(gaps).toContainText('Esto ya lo tocaste en');

    const outside = panel.locator('.learning-profile-grid > div').nth(2);
    await expect(outside.locator('li')).toHaveCount(14);
    await expect(outside).toContainText('React');
    await expect(outside).toContainText('Coding agents');
  });

  test('los gaps se ordenan por fase y demanda dentro del plan', async ({ page }) => {
    await page.goto('/learning/');
    const gaps = page.locator('.learning-profile-plan .learning-profile-grid > div').nth(1);
    const firstGap = gaps.locator('li strong').first();
    await expect(firstGap).toContainText('AI engineering craft');
  });

  test('el contenido del panel sigue el idioma elegido', async ({ page }) => {
    await page.goto('/learning/');
    const gaps = page.locator('.learning-profile-plan .learning-profile-grid > div').nth(1);
    await expect(gaps).toContainText('Cloud (AWS first)');

    await page.locator('.learning-lang-btn', { hasText: 'ES' }).click();
    await expect(gaps).toContainText('Cloud (AWS primero)');
    await expect(gaps).toContainText('Esto ya lo tocaste en');
  });
});
