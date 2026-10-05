import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test.describe('Interview prep page /interview/', () => {
  test('main CV exposes the interview prep navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.site-nav a[href="/interview/"]')).toHaveText('Prep entrevistas');
  });

  test('renders the question bank with a sticky detail panel', async ({ page }) => {
    await page.goto('/interview/');
    await expect(page.getByRole('heading', { name: 'Prep entrevistas' })).toBeVisible();
    await expect(page.locator('.question-card')).toHaveCount(357);
    await expect(page.locator('.detail-panel')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ver respuesta' })).toBeVisible();
  });

  test('filters cards by search and can reveal the answer', async ({ page }) => {
    await page.goto('/interview/');
    const search = page.getByRole('searchbox', { name: 'Buscar en las preguntas' });
    await search.fill('stale results');
    await expect(page.locator('.question-card')).toHaveCount(2);
    await expect(page.locator('.question-card').first()).toContainText(/stale/i);

    await expect(page.locator('.answer-panel')).toBeHidden();
    await page.getByRole('button', { name: 'Ver respuesta' }).click();
    await expect(page.locator('.answer-panel')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ocultar respuesta' })).toBeVisible();
  });

  test('supports every sort order, area filter and keyboard toggle', async ({ page }) => {
    await page.goto('/interview/');
    const firstCard = page.locator('.question-card').first();
    await expect(firstCard.locator('.level-pill')).toContainText('Junior');

    await page.getByRole('combobox', { name: 'Ordenar' }).selectOption('level-desc');
    await expect(firstCard.locator('.level-pill')).toContainText('Architect');

    await page.getByRole('combobox', { name: 'Ordenar' }).selectOption('area');
    await expect(firstCard.locator('.card-area')).toContainText('Agentes y MCP');

    await page.getByRole('combobox', { name: 'Ordenar' }).selectOption('frequency');
    await expect(firstCard.locator('.level-pill')).toContainText('Junior');

    await page.getByRole('combobox', { name: 'Ordenar' }).selectOption('random');
    const beforeShuffle = await firstCard.textContent();
    await page.getByRole('button', { name: 'Re-mezclar' }).click();
    await expect(firstCard).not.toHaveText(beforeShuffle ?? '');

    await page.getByRole('checkbox', { name: 'Agentes y MCP' }).uncheck();
    await expect(page.locator('.question-card')).toHaveCount(348);
    await page.getByRole('checkbox', { name: 'Agentes y MCP' }).check();
    await expect(page.locator('.question-card')).toHaveCount(357);

    const secondCard = page.locator('.question-card').nth(1);
    await secondCard.dispatchEvent('click');
    await expect(secondCard).toHaveClass(/active/);

    const answerToggle = page.getByRole('button', { name: 'Ver respuesta' });
    await answerToggle.focus();
    await answerToggle.press('Space');
    await expect(page.locator('.answer-panel')).toBeVisible();
  });

  test('renders the global sources section', async ({ page }) => {
    await page.goto('/interview/');
    await expect(page.getByRole('heading', { name: 'Fuentes globales' })).toBeVisible();
    await expect(page.locator('.sources-grid a').first()).toBeVisible();
  });

  test('supports tricky and code toggles', async ({ page }) => {
    await page.goto('/interview/');
    await page.getByRole('checkbox', { name: 'Solo tricky' }).check();
    const trickyCount = await page.locator('.question-card').count();
    expect(trickyCount).toBeGreaterThan(0);
    expect(trickyCount).toBeLessThan(357);

    await page.getByRole('checkbox', { name: 'Tiene código' }).check();
    const codeCount = await page.locator('.question-card').count();
    expect(codeCount).toBeGreaterThan(0);
    expect(codeCount).toBeLessThanOrEqual(trickyCount);
  });

  test('opens an area quiz and an accessible code scenario', async ({ page }) => {
    await page.goto('/interview/');
    await page.locator('.quiz-area-button').first().dispatchEvent('click');
    await expect(page.locator('.quiz-panel')).toBeVisible();
    const mcqCount = await page.locator('.mcq').count();
    expect(mcqCount).toBeGreaterThanOrEqual(10);
    expect(mcqCount).toBeLessThanOrEqual(12);
    await page.locator('.mcq input[type="radio"]').first().dispatchEvent('click');
    await expect(page.locator('.mcq-feedback').first()).toBeVisible();
    await page.locator('.scenario').first().locator('summary').dispatchEvent('click');
    await expect(page.locator('.scenario-answer').first()).toBeVisible();
  });

  test('persists the selected level color style independently', async ({ page }) => {
    await page.goto('/interview/');
    await page.getByRole('button', { name: 'Fría' }).click();
    await expect(page.locator('.interview-app')).toHaveClass(/level-style-cool/);
    await page.reload();
    await expect(page.locator('.interview-app')).toHaveClass(/level-style-cool/);
  });

  test('persists learning state and notes and can clear them', async ({ page }) => {
    await page.goto('/interview/');
    const detail = page.locator('.detail-panel');
    await detail.getByRole('button', { name: 'Sé' }).click();
    await detail.getByRole('textbox', { name: 'Notas' }).fill('Repasar event loop y coerción.');

    await page.reload();
    const reloaded = page.locator('.detail-panel');
    await expect(reloaded.getByRole('button', { name: 'Sé' })).toHaveAttribute('aria-pressed', 'true');
    await expect(reloaded.getByRole('textbox', { name: 'Notas' })).toHaveValue('Repasar event loop y coerción.');

    await page.locator('.question-card').nth(1).dispatchEvent('click');
    await expect(page.locator('.detail-panel').getByRole('button', { name: 'Sin marcar' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Limpiar progreso' }).click();
    await expect(page.locator('.detail-panel').getByRole('button', { name: 'Sin marcar' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.detail-panel').getByRole('textbox', { name: 'Notas' })).toHaveValue('');
  });

  test('exports and imports progress with validation', async ({ page }) => {
    await page.goto('/interview/');
    const detail = page.locator('.detail-panel');
    await detail.getByRole('button', { name: 'Repasar' }).click();
    const questionId = await detail.getAttribute('data-question-id');
    expect(questionId).toBeTruthy();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar progreso' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('interview-progress.json');
    const downloaded = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    expect(downloaded.version).toBe(1);
    expect(downloaded.entries[questionId as string].status).toBe('repasar');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"version":2,"entries":{}}')
    });
    await expect(page.locator('.progress-feedback')).toContainText('inválido');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'good.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({ version: 1, entries: { [questionId as string]: { status: 'se', note: 'importado' } } })
      )
    });
    await expect(page.locator('.progress-feedback')).toContainText('importado');
    await expect(detail.getByRole('button', { name: 'Sé' })).toHaveAttribute('aria-pressed', 'true');
    await expect(detail.getByRole('textbox', { name: 'Notas' })).toHaveValue('importado');
  });
});
