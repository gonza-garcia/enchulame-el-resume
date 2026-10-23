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

test.describe('Gates con evidencia citada (ADR-0041)', () => {
  test('el gate con evidencia se presenta citado y sin marcado manual', async ({ page }) => {
    await page.goto('/learning/');
    const phase = page.locator('#fase-3-rag');
    await expect(phase).toContainText('Cumplido con evidencia citada');
    await expect(phase).toContainText('Commit');
    await expect(phase).toContainText('d4e5f6a');
    await expect(phase.locator('a[href="https://example.com/rag-failure-taxonomy"]')).toHaveCount(1);
    await expect(phase).toContainText('Archivo');
    await expect(phase.locator('code', { hasText: 'notes/rag/error-analysis.md' })).toHaveCount(1);
    await expect(phase).toContainText('study log');
    await expect(phase).toContainText('2026-09-30');
    // Sin toggle: el estado lo da la evidencia, no un marcado manual.
    await expect(phase.locator('.learning-gate-evidence')).toHaveCount(1);
    await expect(phase.locator('.learning-gate button')).toHaveCount(0);
  });

  test('el gate sin evidencia se sigue marcando a mano', async ({ page }) => {
    await page.goto('/learning/');
    const phase = page.locator('#fase-0-decision');
    await expect(phase).toContainText('Estado del gate (marcado a mano):');
    await expect(phase.locator('.learning-gate button')).toHaveCount(2);
    await expect(phase).not.toContainText('con evidencia citada');
  });

  test('las citas se rotulan con el idioma activo', async ({ page }) => {
    await page.goto('/learning/');
    await page.locator('.learning-lang-btn', { hasText: 'ES' }).click();
    const phase = page.locator('#fase-3-rag');
    await expect(phase).toContainText('Suite de evaluacion de RAG corriendo en CI');
    await page.locator('.learning-lang-btn', { hasText: 'EN' }).click();
    await expect(phase).toContainText('RAG evaluation suite running in CI');
  });

  test('el resumen desglosa gates con evidencia y marcados a mano', async ({ page }) => {
    await page.goto('/learning/');
    await expect(page.locator('.learning-progress-count')).toContainText('1 con evidencia citada · 0 marcados a mano');
  });
});
