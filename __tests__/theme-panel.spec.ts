import { test, expect } from '@playwright/test';

test.describe('Theme panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('.theme-panel summary');
  });

  test('opens and shows 3 presets + custom', async ({ page }) => {
    await expect(page.locator('.theme-controls')).toBeVisible();
    await expect(page.locator('button[data-theme="navy"]')).toBeVisible();
    await expect(page.locator('button[data-theme="teal"]')).toBeVisible();
    await expect(page.locator('button[data-theme="charcoal"]')).toBeVisible();
    await expect(page.locator('button[data-theme="custom"]')).toBeVisible();
  });

  test('Navy preset applies navy accent color', async ({ page }) => {
    await page.click('button[data-theme="navy"]');
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim()
    );
    expect(accent.toLowerCase()).toBe('#1a365d');
  });

  test('Teal preset applies teal accent color', async ({ page }) => {
    await page.click('button[data-theme="teal"]');
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim()
    );
    expect(accent.toLowerCase()).toBe('#0f4c4c');
  });

  test('Charcoal preset applies charcoal accent color', async ({ page }) => {
    await page.click('button[data-theme="charcoal"]');
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim()
    );
    // lightningcss (Astro 7) puede abreviar #333333 a #333: color equivalente
    expect(accent.toLowerCase()).toMatch(/^#333(333)?$/);
  });

  test('accent applies to name (h1) when "name" is checked', async ({ page }) => {
    await page.click('button[data-theme="teal"]');
    await expect(page.locator('.lang.active h1')).toHaveCSS('color', /rgb\(15,\s*76,\s*76\)/i);
  });

  test('accent applies to section headings (h2) when "sections" is checked', async ({ page }) => {
    await page.click('button[data-theme="navy"]');
    const h2Color = await page.locator('.lang.active h2').first().evaluate((el) => getComputedStyle(el).color);
    // Navy #1a365d → r:26, g:54, b:93
    expect(h2Color).toMatch(/rgb\(26,\s*54,\s*93\)/i);
  });

  test('unchecking "skills" removes accent from skill categories', async ({ page }) => {
    await page.click('button[data-theme="teal"]');
    // Uncheck skills
    await page.click('input[data-accent="skills"]');
    const skillCatColor = await page.locator('.skill-cat').first().evaluate((el) => getComputedStyle(el).color);
    // Without accent, skill-cat falls back to var(--ink) which is #1a1a1a → rgb(26,26,26)
    expect(skillCatColor).toMatch(/rgb\(26,\s*26,\s*26\)/i);
  });

  test('Custom colorpicker only shows when Custom is selected', async ({ page }) => {
    // Initially hidden (Navy is default)
    await expect(page.locator('.theme-picker')).toBeHidden();
    // Click Custom
    await page.click('button[data-theme="custom"]');
    await expect(page.locator('.theme-picker')).toBeVisible();
  });

  test('Custom color below AAA 7:1 is rejected and shows error feedback', async ({ page }) => {
    await page.click('button[data-theme="custom"]');
    // #ff00ff (hot pink) only has ~3.1:1 contrast — should be rejected
    await page.locator('#theme-custom-color').fill('#ff00ff');
    await page.locator('#theme-custom-color').dispatchEvent('input');
    // Verify error feedback visible
    await expect(page.locator('#theme-feedback')).toBeVisible();
    await expect(page.locator('#theme-feedback')).toHaveClass(/error/);
    await expect(page.locator('#theme-feedback')).toContainText(/minimum| mínimo/i);
    // The --accent should NOT have changed to #ff00ff
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim().toLowerCase()
    );
    expect(accent).not.toBe('#ff00ff');
  });

  test('Custom color above AAA 7:1 is accepted and applied', async ({ page }) => {
    await page.click('button[data-theme="custom"]');
    // #1a365d has ~12:1 contrast — should be accepted
    await page.locator('#theme-custom-color').fill('#1a365d');
    await page.locator('#theme-custom-color').dispatchEvent('input');
    await expect(page.locator('#theme-feedback')).toHaveClass(/ok/);
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim().toLowerCase()
    );
    expect(accent).toBe('#1a365d');
  });

  test('theme persists across reloads via localStorage', async ({ page }) => {
    await page.click('button[data-theme="teal"]');
    await page.reload();
    // After reload, teal button should still be selected
    await expect(page.locator('button[data-theme="teal"]')).toHaveAttribute('aria-pressed', 'true');
    const accent = await page.locator('html').evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--accent').trim().toLowerCase()
    );
    expect(accent).toBe('#0f4c4c');
  });
});