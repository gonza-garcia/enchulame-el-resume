import { test, expect } from '@playwright/test';

test.describe('Tab CVs adaptados de Mis CVs', () => {
  test('main CV exposes the adapted resumes tab', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cv-tab', { hasText: 'CVs adaptados' })).toBeVisible();
  });

  test('page loads and sidebar shows offers', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await expect(page.locator('h2')).toContainText(['Ofertas']);
    // Ofertas capturadas en disco (Aurora Labs + Nimbus Software, y las que agreguen)
    await expect(page.locator('.offer-card').count()).resolves.toBeGreaterThan(0);
  });

  test('Aurora Labs offer card has correct metadata', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    const card = page.locator('.offer-card').filter({ hasText: 'Aurora Labs' });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('ReactJS Frontend Developer');
    await expect(card).toContainText('85/100');
    await expect(card).toContainText('CV adaptado');
  });

  test('markdown content renders as HTML (not raw text)', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    // The offer content should have rendered HTML headings
    const offerContent = page.locator('.split-left .split-content').first();
    await expect(offerContent).toBeVisible();
    const h1Elements = offerContent.locator('h1');
    expect(await h1Elements.count()).toBeGreaterThan(0);
    // Offer tab shows the verbatim offer ("Oferta original")
    await expect(offerContent.locator('h1', { hasText: 'Oferta original' })).toBeVisible();
    // Should have <ul> lists from bullet points
    const ulElements = offerContent.locator('ul');
    const ulCount = await ulElements.count();
    expect(ulCount).toBeGreaterThan(0);
  });

  test('match report is a separate tab with the analysis', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    // Aurora Labs is analizada: the Match report tab exists
    await page.locator('.offer-card').filter({ hasText: 'Aurora Labs' }).click();
    const reportTab = page.locator('.split-tabs button', { hasText: 'Match report' });
    await expect(reportTab).toBeVisible();
    await reportTab.click();
    const reportContent = page.locator('.split-left .split-content');
    await expect(reportContent.locator('h1', { hasText: 'An\u00e1lisis de match' })).toBeVisible();
  });

  test('split-screen shows offer on left, adapted CV on right', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    // Seleccionar la tarjeta de Aurora Labs (la primera del listado es la mas nueva)
    await page.locator('.offer-card').filter({ hasText: 'Aurora Labs' }).click();
    await expect(page.locator('.split-left')).toBeVisible();
    await expect(page.locator('.split-right')).toBeVisible();
    // Right side shows adapted CV (EN article is active by default)
    const activeCv = page.locator('.split-right article.lang.active');
    await expect(activeCv.locator('h1')).toContainText('Ariana Montiel');
    // Adapted CV has Context API (key adjustment for Aurora Labs)
    await expect(activeCv).toContainText('Context API');
    // Adapted CV has SOLID (key adjustment for Aurora Labs)
    await expect(activeCv).toContainText('SOLID');
  });

  test('back button returns to the CVs base tab', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await page.locator('.back-link').click();
    await expect(page.locator('.cv-panel[data-tab="base"]')).toBeVisible();
    await expect(page.locator('.cv-panel[data-tab="adapted"]')).toBeHidden();
  });

  test('match score badge shows correct color (high = green)', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    const score = page.locator('.offer-card').filter({ hasText: 'Aurora Labs' }).locator('.offer-card-score');
    await expect(score).toHaveClass(/high/);
    await expect(score).toContainText('85/100');
  });

  test('adapted CV renders all sections', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await page.locator('.offer-card').filter({ hasText: 'Nimbus Software' }).click();
    const activeCv = page.locator('.split-right article.lang.active');
    await expect(activeCv.locator('h2', { hasText: 'Professional Summary' })).toBeVisible();
    await expect(activeCv.locator('h2', { hasText: 'Skills' })).toBeVisible();
    await expect(activeCv.locator('h2', { hasText: 'Work Experience' })).toBeVisible();
    await expect(activeCv.locator('h2', { hasText: 'Education' })).toBeVisible();
    await expect(activeCv.locator('h2', { hasText: 'Certifications' })).toBeVisible();
  });

  test('education note renders in the Aurora Labs adapted CV', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await page.locator('.offer-card').filter({ hasText: 'Aurora Labs' }).click();
    await expect(page.locator('.split-right')).toContainText('degree unfinished');
  });
});
