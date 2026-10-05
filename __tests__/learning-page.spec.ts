import { test, expect } from '@playwright/test';

test.describe('Pagina /learning (plan navegable)', () => {
  test('renderiza el plan de ejemplo con titulo y posicionamiento activo de contexto', async ({
    page
  }) => {
    await page.goto('/learning/');
    await expect(page.locator('.learning-app h1')).toContainText('Study plan');
    await expect(page.locator('.learning-positioning')).toContainText('Frontend');
  });

  test('muestra las fases en orden con gate, tema y proyecto', async ({ page }) => {
    await page.goto('/learning/');
    const phases = page.locator('.learning-phase');
    await expect(phases).toHaveCount(7);

    const orders = await page.locator('.learning-phase-order').allTextContents();
    expect(orders).toEqual([
      'Fase 0',
      'Fase 1',
      'Fase 2',
      'Fase 3',
      'Fase 4',
      'Fase 5',
      'Fase 6'
    ]);

    const first = phases.first();
    await expect(first).toContainText('Decision');
    await expect(first).toContainText('Gate');

    const rag = phases.nth(3);
    await expect(rag).toContainText('RAG');
    await expect(rag).toContainText('error analysis');
  });

  test('el orden de ataque de roles muestra la fase que habilita cada rol', async ({ page }) => {
    await page.goto('/learning/');
    const roles = page.locator('.learning-role');
    await expect(roles).toHaveCount(3);
    await expect(roles.nth(0)).toContainText('AI Product Engineer');
    await expect(roles.nth(0)).toContainText('Python, minimal backend');
    await expect(roles.nth(0)).toContainText('Fase que lo habilita');
  });

  test('cada recurso muestra sus datos y chips de skills con demanda', async ({ page }) => {
    await page.goto('/learning/');
    const resource = page.locator('.learning-resource').filter({
      hasText: "CS50's Introduction to Programming with Python"
    });
    await expect(resource).toBeVisible();
    await expect(resource).toContainText('Harvard CS50');
    await expect(resource).toContainText('edX y YouTube');
    await expect(resource).toContainText('Free');
    await expect(resource.locator('a')).toHaveAttribute('href', 'https://cs50.harvard.edu/python/');

    const chip = resource.locator('.learning-chip').first();
    await expect(chip).toContainText('Python');
    await expect(chip.locator('.learning-chip-demand')).toContainText('70.8%');
  });

  test('anti-lista, senales de salida e investigacion se muestran como listas', async ({ page }) => {
    await page.goto('/learning/');
    await expect(page.locator('.learning-anti')).toContainText('bootcamp');
    await expect(page.locator('.learning-exit')).toContainText('error analysis');
    const reading = page.locator('.learning-reading');
    await expect(reading).toContainText('AI Engineering Field Guide');
    await expect(reading).toContainText('nothiring.me');
    await expect(reading.locator('.learning-reading-list li')).toHaveCount(7);
  });

  test('el toggle del plan renderiza el contenido en es o en segun el idioma', async ({ page }) => {
    await page.goto('/learning/');
    await expect(page.locator('.learning-app h1')).toContainText('Study plan');

    await page.locator('.learning-lang-btn', { hasText: 'ES' }).click();
    await expect(page.locator('.learning-app h1')).toContainText('Plan de estudios');
    await expect(page.locator('.learning-role').first()).toContainText('El frontend full-stack es la ventaja');

    await page.locator('.learning-lang-btn', { hasText: 'EN' }).click();
    await expect(page.locator('.learning-app h1')).toContainText('Study plan');
  });

  test('el idioma elegido persiste en la misma clave del sitio', async ({ page }) => {
    await page.goto('/learning/');
    await page.locator('.learning-lang-btn', { hasText: 'ES' }).click();
    await page.reload();
    await expect(page.locator('.learning-app h1')).toContainText('Plan de estudios');
    const stored = await page.evaluate(() => localStorage.getItem('resume-lang'));
    expect(stored).toBe('es');
  });
});
