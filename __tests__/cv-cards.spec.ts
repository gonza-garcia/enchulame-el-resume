import { test, expect } from '@playwright/test';

test.describe('Cards por posicionamiento del CV base', () => {
  test('una card por posicionamiento, con titulo, resumen y acciones', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.cv-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('.cv-card-title')).toHaveText('Frontend Developer');
    await expect(cards.nth(1).locator('.cv-card-title')).toHaveText('AI Developer');
    await expect(cards.nth(0).locator('.cv-card-summary')).not.toBeEmpty();
    await expect(page.locator('[data-card-action="print"]')).toHaveCount(2);
    await expect(page.locator('[data-card-action="export"]')).toHaveCount(2);
  });

  test('la card del posicionamiento activo queda marcada y sigue al CV', async ({ page }) => {
    await page.goto('/');
    const frontend = page.locator('button[data-positioning="frontend"]');
    const ai = page.locator('button[data-positioning="ai"]');
    await expect(frontend).toHaveAttribute('aria-pressed', 'true');
    await expect(ai).toHaveAttribute('aria-pressed', 'false');

    await ai.click();
    await expect(ai).toHaveAttribute('aria-pressed', 'true');
    await expect(frontend).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#cv-panel-base article.lang.active')).toHaveAttribute('data-positioning', 'ai');
  });

  test('la seleccion de la card sobrevive a la recarga', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[data-positioning="ai"]').click();
    await page.reload();
    await expect(page.locator('button[data-positioning="ai"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#cv-panel-base article.lang.active')).toHaveAttribute('data-positioning', 'ai');
  });

  test('"Exportar" selecciona el CV de la card y abre el menu de export', async ({ page }) => {
    await page.goto('/');
    await page.locator('.cv-card[data-positioning="ai"] [data-card-action="export"]').click();
    await expect(page.locator('button[data-positioning="ai"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.export-menu')).toBeVisible();
  });

  test('"Imprimir PDF" imprime el CV de la card, no el activo previo', async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => {
        (window as unknown as { __printedTitle?: string }).__printedTitle = document.title;
      };
    });
    await page.goto('/');
    // El CV activo arranca en frontend; la accion de la card AI debe imprimir AI.
    await page.locator('.cv-card[data-positioning="ai"] [data-card-action="print"]').click();
    const title = await page.evaluate(
      () => (window as unknown as { __printedTitle?: string }).__printedTitle
    );
    expect(title).toBe('Montiel Ariana - CV - EN');
    await expect(page.locator('#cv-panel-base article.lang.active')).toHaveAttribute('data-positioning', 'ai');
  });

  test('las cards no se imprimen', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    const display = await page.locator('.cv-cards').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});
