import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let createdOfferDir: string | null = null;

/** Espera a que la isla React este hidratada y acepte interaccion. */
async function waitHydrated(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-offers-hydrated') === 'true'
  );
}

test.describe.serial('Offers manager (isla React en /adapted)', () => {
  test.afterAll(() => {
    if (createdOfferDir) fs.rmSync(createdOfferDir, { recursive: true, force: true });
  });

  test('endpoint /api/job-offers.json lista el disco con estado derivado', async ({ request }) => {
    const res = await request.get('/api/job-offers.json');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.offers)).toBe(true);
    const ayi = data.offers.find((o: { slug: string }) => o.slug.includes('aurora-labs'));
    expect(ayi).toBeTruthy();
    expect(ayi.meta.empresa).toBe('Aurora Labs');
    expect(ayi.estado).toBe('adaptada');
    expect(ayi.matchScore).toBe(85);
    expect(ayi.meta.salario).toBe(null);
    expect(ayi.meta.recruiter).toBe(null);
  });

  test('badges por estado y botones por estado', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    const card = page.locator('.offer-card').filter({ hasText: 'Nimbus Software' });
    await expect(card.locator('.offer-card-badge')).toContainText('CV adaptado');
    // En estado adaptada queda solo el boton de cover letter (sin analizar ni adaptar)
    await expect(card.locator('.offer-action-btn')).toHaveCount(1);
    await expect(card.locator('.offer-action-btn')).toContainText('Cover letter');
  });

  test('agregar oferta: validacion y guardado con verificacion end-to-end', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    await page.getByRole('button', { name: '+ Agregar oferta' }).click();

    // Submit vacio: empresa y rol obligatorios, y link o texto
    await page.getByRole('button', { name: 'Guardar oferta' }).click();
    await expect(page.locator('.form-err').first()).toBeVisible();

    // Completar el form
    await page.getByRole('textbox', { name: 'Ej: Aurora Labs' }).fill('TestCorp');
    await page.getByRole('textbox', { name: 'Ej: ReactJS Frontend Developer' }).fill('Frontend Developer');
    await page
      .getByRole('textbox', { name: 'Pegá acá el texto completo de la oferta...' })
      .fill('TestCorp busca Frontend Developer con React y TypeScript. Requisitos: 3 años de experiencia, Redux, testing.');
    await page.getByText('Extras opcionales').click();
    await page.getByRole('textbox', { name: 'Salario o rango' }).fill('USD 5000/mes');
    await page.getByRole('button', { name: 'Guardar oferta' }).click();

    // SaveModal aparece con el archivo compuesto
    await expect(page.getByRole('dialog', { name: 'Guardar oferta' })).toBeVisible();
    const filePath = page.locator('.save-file-head code').first();
    const relativeOfferPath = (await filePath.textContent())?.trim() ?? '';
    expect(relativeOfferPath).toMatch(/^docs\/job-offers\/\d{4}-\d{2}-\d{2}-testcorp-frontend-developer\/offer\.md$/);
    const slug = relativeOfferPath.split('/')[2];
    const offerDir = path.resolve(
      fileURLToPath(new URL('.', import.meta.url)),
      '..',
      'docs',
      'job-offers',
      slug
    );
    createdOfferDir = offerDir;

    // Verificar sin archivo en disco: ✗
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.locator('.verify-result.verify-bad')).toBeVisible();

    // Simular al agente externo escribiendo el archivo verbatim
    await page.getByRole('button', { name: 'Ver contenido' }).click();
    const content = await page.locator('.save-file-content').textContent();
    expect(content).toContain('salario: USD 5000/mes');
    expect(content).toContain('recruiter: N/A');
    expect(content).not.toContain('- Salario:');
    fs.mkdirSync(offerDir, { recursive: true });
    fs.writeFileSync(path.join(offerDir, 'offer.md'), content ?? '');

    // Verificar de nuevo: ✓
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.locator('.verify-result.verify-ok')).toContainText('est\u00e1 en disco');

    // Cerrar: el estado del modal es interno, el disco ya tiene la oferta
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  });

  test('oferta agregada aparece en sidebar con badge Agregada y botones de analisis', async ({ page }) => {
    // La oferta de la suite serial anterior persiste en disco hasta afterAll
    await page.goto('/adapted/');
    await waitHydrated(page);
    const card = page
      .locator('.offer-card')
      .filter({ hasText: 'TestCorp' });
    await expect(card).toHaveCount(1);
    await expect(card.locator('.offer-card-badge')).toContainText('Agregada');
    await expect(card.getByRole('button', { name: 'Analizar', exact: true })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Analizar a mano' })).toBeVisible();
    await expect(card.locator('.offer-card-score')).toHaveCount(0);
  });

  test('modal de IA de captura: prompt con placeholder y autocompletado del form', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    await page.getByRole('button', { name: '+ Agregar oferta' }).click();
    await page.getByRole('button', { name: 'Usar IA' }).click();

    const dialog = page.getByRole('dialog', { name: 'Capturar con IA' });
    await expect(dialog).toBeVisible();
    // Columna 1: prompt con skill y placeholder
    const prompt = dialog.locator('.ai-prompt');
    await expect(prompt).toContainText('capture-job-offer');
    await expect(prompt).toContainText('[INSERTAR TEXTO DE OFERTA AQUI]');

    // Columna 2: pegar JSON capturado simulado
    const captureJson = {
      empresa: 'IA Corp',
      rol: 'React Developer',
      fecha: '2026-09-16',
      url: null,
      modalidad: 'remote',
      location: null,
      salario: 'Up to £85,000',
      recruiter: 'Jane Doe',
      descripcion_empresa: null,
      oferta_texto: 'IA Corp busca React Developer remoto.'
    };
    await dialog.locator('.ai-paste').fill('Aca va el analisis:\n\n```json\n' + JSON.stringify(captureJson, null, 2) + '\n```');
    await dialog.getByRole('button', { name: 'Continuar' }).click();

    // El formulario queda autocompletado
    await expect(page.getByRole('textbox', { name: 'Ej: Aurora Labs' })).toHaveValue('IA Corp');
    await expect(page.getByRole('textbox', { name: 'Ej: ReactJS Frontend Developer' })).toHaveValue('React Developer');
    await expect(page.getByRole('textbox', { name: 'Pegá acá el texto completo de la oferta...' })).toHaveValue('IA Corp busca React Developer remoto.');
    await page.getByText('Extras opcionales').click();
    await expect(page.getByRole('textbox', { name: 'Salario o rango' })).toHaveValue('Up to £85,000');
    await expect(page.getByRole('textbox', { name: 'Recruiter / contacto' })).toHaveValue('Jane Doe');
  });

  test('modal de IA de captura rechaza output sin JSON', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    await page.getByRole('button', { name: '+ Agregar oferta' }).click();
    await page.getByRole('button', { name: 'Usar IA' }).click();
    const dialog = page.getByRole('dialog', { name: 'Capturar con IA' });
    await dialog.locator('.ai-paste').fill('El agente devolvio texto sin JSON.');
    await dialog.getByRole('button', { name: 'Continuar' }).click();
    await expect(dialog.locator('.modal-error')).toContainText('No hay un bloque ```json');
  });

  test('analisis manual: template y guardado de match-report', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    const card = page.locator('.offer-card').filter({ hasText: 'TestCorp' });
    await card.getByRole('button', { name: 'Analizar a mano' }).click();

    const manual = page.getByRole('dialog', { name: 'Analizar a mano' });
    await expect(manual.locator('.manual-report')).toContainText('# An\u00e1lisis de match');
    // Completar score para simular analisis
    const text = await manual.locator('.manual-report').inputValue();
    await manual.locator('.manual-report').fill(text.replace('match_score: 0', 'match_score: 72'));
    await manual.getByRole('button', { name: 'Continuar al guardado' }).click();

    const save = page.getByRole('dialog', { name: 'Guardar an\u00e1lisis (manual)' });
    await expect(save.locator('.save-file-head code')).toContainText('match-report.md');

    // Simular agente y verificar
    await save.getByRole('button', { name: 'Ver contenido' }).click();
    const content = await save.locator('.save-file-content').textContent();
    if (!createdOfferDir) throw new Error('The captured offer directory was not created');
    fs.writeFileSync(path.join(createdOfferDir, 'match-report.md'), content ?? '');
    await save.getByRole('button', { name: 'Verificar' }).click();
    await expect(save.locator('.verify-result.verify-ok')).toContainText('est\u00e1 en disco');
  });

  test('oferta analizada muestra badge y bot\u00f3n Adaptar CV', async ({ page }) => {
    await page.goto('/adapted/');
    await waitHydrated(page);
    const card = page.locator('.offer-card').filter({ hasText: 'TestCorp' });
    await expect(card.locator('.offer-card-badge')).toContainText('Analizada');
    await expect(card.locator('.offer-card-score')).toContainText('72/100');
    await expect(card.getByRole('button', { name: 'Adaptar CV' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Analizar', exact: true })).toHaveCount(0);
  });

  test('cover letter: prompt, vista previa editable, descarga y guardado', async ({ page }) => {
    // Nimbus Software esta adaptada: el boton Cover letter esta disponible
    await page.goto('/adapted/');
    await waitHydrated(page);
    await page.locator('.offer-card').filter({ hasText: 'Nimbus Software' }).getByRole('button', { name: 'Cover letter' }).click();

    const dialog = page.getByRole('dialog', { name: 'Cover letter: Nimbus Software' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.ai-prompt')).toContainText('adapt-resume-to-offer');
    await expect(dialog.locator('.ai-prompt')).toContainText('Cover letter');

    const letterJson = {
      subject: 'Senior Frontend Engineer - application',
      letter: 'Hi Nimbus team,\n\nI build React frontends for data-heavy products. Most recently I modernized the Freightline Control cargo operations console at Aeronix Logistics, a real-time React application that replaced dozens of spreadsheets and internal tools.\n\nTwo details from your post stood out: the end-to-end ownership of product surfaces and the focus on real-time analytics dashboards. Both describe how I already work: I designed a shared component library used by two teams, and I raised test coverage with Vitest until weekly releases were sustainable.\n\nI am based in Rosario, Argentina, fully remote-ready. Happy to walk through details in a call.\n\nAriana Montiel',
      locale: 'en'
    };
    await dialog.locator('.ai-paste').fill('```json\n' + JSON.stringify(letterJson, null, 2) + '\n```');
    await dialog.getByRole('button', { name: 'Revisar carta' }).click();

    // Vista previa: editable + descargable
    const preview = page.locator('.modal-box.modal-cover');
    await expect(preview.locator('.cover-text')).toContainText('Hi Nimbus team');
    await expect(preview.locator('.cover-words')).toBeVisible();
    // Edicion manual del usuario
    await preview.locator('.cover-text').fill(letterJson.letter + '\n\nP.S. Edited by user.');
    const downloadPromise = page.waitForEvent('download');
    await preview.getByRole('button', { name: 'Descargar cover-letter.md' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('cover-letter.md');

    // Confirmar → SaveModal con el archivo compuesto (incluye la edicion del usuario)
    await preview.getByRole('button', { name: 'Continuar al guardado' }).click();
    const save = page.getByRole('dialog', { name: 'Guardar cover letter' });
    await expect(save.locator('.save-file-head code')).toContainText('nimbus-software-senior-frontend-engineer/cover-letter.md');
    await save.getByRole('button', { name: 'Ver contenido' }).click();
    await expect(save.locator('.save-file-content')).toContainText('P.S. Edited by user.');
  });
});
