import { test, expect } from '@playwright/test';

const DESTINATIONS = [
  { label: 'Mis CVs', href: '/' },
  { label: 'Prep entrevistas', href: '/interview/' },
  { label: 'Plan de estudios', href: '/learning/' }
];

const PAGES = ['/', '/?tab=adaptados', '/interview/', '/learning/'];

test.describe('Navbar consistente (3 destinos)', () => {
  for (const path of PAGES) {
    test(`muestra los 3 destinos y el brand en ${path}`, async ({ page }) => {
      await page.goto(path);
      const links = page.locator('nav.site-nav .site-nav-link');
      await expect(links).toHaveCount(3);
      for (const destino of DESTINATIONS) {
        await expect(
          page.locator('nav.site-nav .site-nav-link', { hasText: destino.label })
        ).toHaveAttribute('href', destino.href);
      }
      await expect(page.locator('a.brand')).toHaveAttribute('href', '/');
    });
  }

  test('cada pagina marca su destino como activo', async ({ page }) => {
    const cases: Array<[string, string]> = [
      ['/', 'Mis CVs'],
      ['/?tab=adaptados', 'Mis CVs'],
      ['/interview/', 'Prep entrevistas'],
      ['/learning/', 'Plan de estudios']
    ];
    for (const [path, label] of cases) {
      await page.goto(path);
      const active = page.locator('nav.site-nav .site-nav-link.active');
      await expect(active).toHaveCount(1);
      await expect(active).toHaveText(label);
      await expect(active).toHaveAttribute('aria-current', 'page');
    }
  });

  test('los controles del toolbar (idioma, export, tema) solo viven en Mis CVs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-export')).toHaveCount(1);
    await expect(page.locator('.theme-panel')).toHaveCount(1);

    for (const path of ['/interview/', '/learning/']) {
      await page.goto(path);
      await expect(page.locator('#btn-export')).toHaveCount(0);
      await expect(page.locator('.theme-panel')).toHaveCount(0);
    }
  });

  test('la barra slim no se imprime en las islas', async ({ page }) => {
    for (const path of ['/interview/', '/learning/']) {
      await page.goto(path);
      await page.emulateMedia({ media: 'print' });
      const display = await page.locator('.toolbar').first().evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe('none');
      await page.emulateMedia({ media: 'screen' });
    }
  });
});
