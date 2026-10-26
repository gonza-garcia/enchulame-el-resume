import { test, expect } from '@playwright/test';

test.describe('Mis perfiles: tabs CVs base / CVs adaptados', () => {
  test('por defecto se ve la tab CVs base con las cards y el CV', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cv-tab-base')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.cv-panel[data-tab="base"]')).toBeVisible();
    await expect(page.locator('.cv-panel[data-tab="adapted"]')).toBeHidden();
    await expect(page.locator('.cv-card').first()).toBeVisible();
  });

  test('cambiar de tab muestra el gestor de ofertas y oculta el CV base', async ({ page }) => {
    await page.goto('/');
    await page.locator('#cv-tab-adapted').click();
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-offers-hydrated') === 'true'
    );
    await expect(page.locator('.cv-panel[data-tab="adapted"]')).toBeVisible();
    await expect(page.locator('.cv-panel[data-tab="base"]')).toBeHidden();
    await expect(page.locator('.offer-card').first()).toBeVisible();
    expect(new URL(page.url()).searchParams.get('tab')).toBe('adaptados');
  });

  test('el deep link ?tab=adaptados abre directo la tab de adaptados', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await expect(page.locator('#cv-tab-adapted')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.cv-panel[data-tab="base"]')).toBeHidden();
    await expect(page.locator('.cv-panel[data-tab="adapted"]')).toBeVisible();
  });

  test('volver a CVs base limpia el parametro de la URL', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await page.locator('#cv-tab-base').click();
    await expect(page.locator('.cv-panel[data-tab="base"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.get('tab')).toBeNull();
  });

  test('la tab de adaptados solo imprime el CV adaptado seleccionado', async ({ page }) => {
    await page.goto('/?tab=adaptados');
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-offers-hydrated') === 'true'
    );
    await page.emulateMedia({ media: 'print' });
    const visible = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article.lang'))
        .filter((article) => article.checkVisibility())
        .map((article) => `${article.getAttribute('data-lang')}`)
    );
    expect(visible.length).toBeGreaterThan(0);
    // Ningun articulo del CV base se imprime desde la tab de adaptados.
    await page.emulateMedia({ media: 'screen' });
    const baseVisible = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.cv-panel[data-tab="base"] article.lang'))
        .some((article) => article.checkVisibility())
    );
    expect(baseVisible).toBe(false);
  });

  test('las tabs no se imprimen', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    const display = await page.locator('.cv-tabs').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});
