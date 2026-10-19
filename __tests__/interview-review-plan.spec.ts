import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** Espera a que la isla React esté hidratada y acepte interacción. */
async function waitHydrated(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-interview-hydrated') === 'true'
  );
}

const AURORA_SLUG = '2026-10-05-aurora-labs-reactjs-frontend-developer';

interface ReviewPlanFixture {
  items: { id: string; tema: string; questionIds: string[] }[];
  gaps: { topic: string }[];
}

const plan: ReviewPlanFixture = JSON.parse(
  fs.readFileSync(
    path.resolve('docs', 'job-offers', AURORA_SLUG, 'interview-review-plan.json'),
    'utf8'
  )
);
const planQuestionCount = new Set(plan.items.flatMap((item) => item.questionIds)).size;

test.describe('Repaso de entrevista en /interview (ADR-0035)', () => {
  test('el deep link pide confirmación y cancelar no carga nada', async ({ page }) => {
    await page.goto(`/interview/?repaso=${AURORA_SLUG}`);
    await waitHydrated(page);
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('¿Cargar el repaso de Aurora Labs?');
    await expect(dialog).toContainText(`${plan.items.length} temas priorizados`);
    await expect(dialog).toContainText(`${plan.gaps.length} hueco`);
    await expect(dialog).toContainText('no se toca');
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('.review-panel')).toHaveCount(0);
  });

  test('confirmar carga el panel con temas, chips y huecos, y muestra el toast', async ({ page }) => {
    await page.goto(`/interview/?repaso=${AURORA_SLUG}`);
    await waitHydrated(page);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cargar repaso' }).click();

    const panel = page.locator('.review-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Aurora Labs');
    await expect(panel).toContainText(`0/${plan.items.length} temas dominados`);
    await expect(panel.locator('.review-item')).toHaveCount(plan.items.length);
    await expect(panel.locator('.review-item').first()).toContainText(plan.items[0].tema);
    await expect(panel.locator('.review-chip')).toHaveCount(planQuestionCount);
    await expect(panel).toContainText('Huecos del banco');
    await expect(panel).toContainText(plan.gaps[0].topic);
    await expect(panel).toContainText('Se repasan fuera de /interview');

    // El toast confirma la carga
    await expect(page.getByText('Repaso de Aurora Labs cargado.')).toBeVisible();

    // Un chip abre la pregunta en el panel de detalle
    await panel.locator('.review-chip').first().click();
    await expect(page.locator('.detail-panel')).toHaveAttribute(
      'data-question-id',
      plan.items[0].questionIds[0]
    );
  });

  test('las marcas por tema persisten sin tocar interview-progress', async ({ page }) => {
    // Sembrar un progreso de estudio conocido y anotarlo byte a byte
    await page.goto('/interview/');
    await waitHydrated(page);
    await page.evaluate(() => {
      localStorage.setItem(
        'interview-progress',
        JSON.stringify({
          version: 1,
          entries: { 'testing-quality-rtl-user-behavior': { status: 'se', note: 'nota intacta' } }
        })
      );
    });
    const before = await page.evaluate(() => localStorage.getItem('interview-progress'));

    await page.goto(`/interview/?repaso=${AURORA_SLUG}`);
    await waitHydrated(page);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cargar repaso' }).click();
    const panel = page.locator('.review-panel');
    await panel.locator('.review-item').first().getByRole('checkbox').click();
    await expect(panel).toContainText(`1/${plan.items.length} temas dominados`);

    // Persiste en su clave propia, sin volver a pedir confirmación, y el progreso
    // del banco queda byte a byte igual
    await page.goto('/interview/');
    await waitHydrated(page);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.locator('.review-panel')).toBeVisible();
    await expect(page.locator('.review-panel')).toContainText(
      `1/${plan.items.length} temas dominados`
    );
    const after = await page.evaluate(() => localStorage.getItem('interview-progress'));
    expect(after).toBe(before);
    const review = await page.evaluate(() => localStorage.getItem('interview-review'));
    expect(JSON.parse(review ?? '{}').activeSlug).toBe(AURORA_SLUG);
  });

  test('el filtro opcional limita el listado a las preguntas del repaso', async ({ page }) => {
    await page.goto(`/interview/?repaso=${AURORA_SLUG}`);
    await waitHydrated(page);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cargar repaso' }).click();

    const panel = page.locator('.review-panel');
    const allCount = Number(await page.locator('.results-count strong').textContent());
    expect(allCount).toBeGreaterThan(planQuestionCount);

    await panel.getByLabel('Filtrar el listado al repaso').check();
    await expect(page.locator('.question-card')).toHaveCount(planQuestionCount);
    await expect(page.locator('.results-count strong')).toHaveText(String(planQuestionCount));

    await panel.getByLabel('Filtrar el listado al repaso').uncheck();
    await expect(page.locator('.results-count strong')).toHaveText(String(allCount));
  });

  test('salir del repaso oculta el panel y conserva las marcas', async ({ page }) => {
    await page.goto(`/interview/?repaso=${AURORA_SLUG}`);
    await waitHydrated(page);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cargar repaso' }).click();
    const panel = page.locator('.review-panel');
    await panel.locator('.review-item').first().getByRole('checkbox').click();
    await panel.getByRole('button', { name: 'Salir del repaso' }).click();

    await expect(page.locator('.review-panel')).toHaveCount(0);
    const review = await page.evaluate(() => localStorage.getItem('interview-review'));
    const parsed = JSON.parse(review ?? '{}');
    expect(parsed.activeSlug).toBe(null);
    expect(Object.keys(parsed.marks ?? {}).length).toBeGreaterThan(0);
  });
});
