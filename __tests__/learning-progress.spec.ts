import { test, expect } from '@playwright/test';
import {
  emptyLearningProgress,
  gateDisplayState,
  setGateStatus,
  summarizeProgress
} from '../src/lib/learning-progress';
import type { PlanEvidence, PlanPhase } from '../src/schemas/learning-plan';

const citedEvidence: PlanEvidence[] = [
  {
    type: 'commit',
    ref: 'd4e5f6a',
    label: { es: 'Suite de evaluacion en CI', en: 'Evaluation suite in CI' },
    asOf: '2026-09-30',
    source: 'study log'
  }
];
const phaseWithEvidence: Pick<PlanPhase, 'id' | 'gateEvidence'> = {
  id: 'fase-3-rag',
  gateEvidence: citedEvidence
};
const phaseWithoutEvidence: Pick<PlanPhase, 'id' | 'gateEvidence'> = { id: 'fase-0-decision' };

test.describe('Estado derivado de gates (ADR-0041)', () => {
  test('con citas el estado es con-evidencia y el marcado manual no aplica', () => {
    const progress = setGateStatus(emptyLearningProgress(), 'fase-3-rag', 'cumplido');
    expect(gateDisplayState(phaseWithEvidence, progress)).toBe('con-evidencia');
    expect(gateDisplayState(phaseWithoutEvidence, emptyLearningProgress())).toBe('pendiente');
    expect(
      gateDisplayState(phaseWithoutEvidence, setGateStatus(emptyLearningProgress(), 'fase-0-decision', 'cumplido'))
    ).toBe('marcado-a-mano');
  });

  test('el resumen desglosa evidencia citada y marcado manual', () => {
    const progress = setGateStatus(emptyLearningProgress(), 'fase-0-decision', 'cumplido');
    const summary = summarizeProgress(progress, ['recurso-a'], [phaseWithEvidence, phaseWithoutEvidence]);
    expect(summary).toEqual({
      markedResources: 0,
      totalResources: 1,
      metGates: 2,
      totalGates: 2,
      evidenceGates: 1,
      manualGates: 1
    });
  });
});

test.describe('Progreso en /learning', () => {
  test('marca recursos y gates, actualiza el conteo global y persiste en la clave propia', async ({
    page
  }) => {
    await page.goto('/learning/');
    await expect(page.locator('.learning-progress-count')).toContainText('0/26 recursos');

    const firstResource = page.locator('.learning-resource').first();
    await firstResource.getByRole('button', { name: 'Hecho' }).click();
    await expect(page.locator('.learning-progress-count')).toContainText('1/26 recursos');

    await page.locator('.learning-gate').first().getByRole('button', { name: 'Cumplido' }).click();
    await expect(page.locator('.learning-progress-count')).toContainText('2/7 gates cumplidos');
    await expect(page.locator('.learning-progress-count')).toContainText(
      '1 con evidencia citada · 1 marcados a mano'
    );

    await page.reload();
    await expect(page.locator('.learning-progress-count')).toContainText('1/26 recursos');
    await expect(page.locator('.learning-progress-count')).toContainText('2/7 gates cumplidos');

    const stored = await page.evaluate(() => localStorage.getItem('learning-progress'));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? '{}');
    expect(parsed.version).toBe(1);
    expect(Object.values(parsed.entries).some((entry: { status: string }) => entry.status === 'hecho')).toBe(true);
    expect(Object.values(parsed.gates).some((entry: { status: string }) => entry.status === 'cumplido')).toBe(true);
  });

  test('cambiar un recurso a sin marcar lo saca del store', async ({ page }) => {
    await page.goto('/learning/');
    const firstResource = page.locator('.learning-resource').first();
    await firstResource.getByRole('button', { name: 'Skipped' }).click();
    await expect(page.locator('.learning-progress-count')).toContainText('1/26 recursos');
    await firstResource.getByRole('button', { name: 'Sin marcar' }).click();
    await expect(page.locator('.learning-progress-count')).toContainText('0/26 recursos');

    const stored = await page.evaluate(() => localStorage.getItem('learning-progress'));
    expect(JSON.parse(stored ?? '{}').entries).toEqual({});
  });

  test('exporta el progreso como JSON descargable', async ({ page }) => {
    await page.goto('/learning/');
    await page.locator('.learning-resource').first().getByRole('button', { name: 'Hecho' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('learning-progress.json');
  });

  test('importa un progreso valido y rechaza uno invalido con mensaje claro', async ({ page }) => {
    await page.goto('/learning/');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'learning-progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          entries: { 'cs50-python': { status: 'en-curso' } },
          gates: { 'fase-1-backend-cloud': { status: 'cumplido' } }
        })
      )
    });
    await expect(page.locator('.learning-progress-feedback')).toHaveText('Progreso importado.');
    await expect(page.locator('.learning-progress-count')).toContainText('1/26 recursos');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{not json')
    });
    await expect(page.locator('.learning-progress-feedback')).toContainText('Archivo inválido');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'wrong-shape.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ version: 2, entries: {}, gates: {} }))
    });
    await expect(page.locator('.learning-progress-feedback')).toContainText(
      'el formato de progreso no se reconoce'
    );
  });

  test('borrar deja el estado manual vacio y lo dice; la evidencia citada se mantiene', async ({
    page
  }) => {
    await page.goto('/learning/');
    await page.locator('.learning-resource').first().getByRole('button', { name: 'Hecho' }).click();
    await page.locator('.learning-gate').first().getByRole('button', { name: 'Cumplido' }).click();

    await page.getByRole('button', { name: 'Borrar' }).click();
    await expect(page.locator('.learning-progress-feedback')).toHaveText('Progreso borrado.');
    await expect(page.locator('.learning-progress-count')).toContainText('0/26 recursos');
    // El gate con evidencia citada no depende del store: su estado vive en el plan.
    await expect(page.locator('.learning-progress-count')).toContainText('1/7 gates cumplidos');
    await expect(page.locator('.learning-progress-count')).toContainText(
      '1 con evidencia citada · 0 marcados a mano'
    );
  });
});
