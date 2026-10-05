import { test, expect } from '@playwright/test';

test.describe('LinkedIn export modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-export');
    await page.click('[data-export="linkedin"]');
    await expect(page.locator('#linkedin-modal')).toHaveClass(/open/);
  });

  test('opens with Sections tab active by default', async ({ page }) => {
    await expect(page.locator('#tab-sections')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#tab-posts')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#panel-sections')).toBeVisible();
    await expect(page.locator('#panel-posts')).toBeHidden();
  });

  test('Sections textarea contains expected LinkedIn-formatted content', async ({ page }) => {
    const value = await page.locator('#linkedin-output').inputValue();
    expect(value).toContain('Ariana Montiel');
    expect(value).toContain('ABOUT');
    expect(value).toContain('EXPERIENCE');
    expect(value).toContain('SKILLS');
    expect(value).toContain('CONTACT');
  });

  test('clicking Open-to-Work Posts tab swaps panels', async ({ page }) => {
    await page.click('#tab-posts');
    await expect(page.locator('#tab-posts')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#tab-sections')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#panel-posts')).toBeVisible();
    await expect(page.locator('#panel-sections')).toBeHidden();
  });

  test('Posts panel shows single textarea with EN content by default', async ({ page }) => {
    await page.click('#tab-posts');
    const postTextarea = page.locator('#linkedin-post');
    await expect(postTextarea).toBeVisible();
    const en = await postTextarea.inputValue();
    expect(en).toContain('Hi network');
    expect(en).toContain('#OpenToWork');
  });

  test('Modal toggle switches post between EN and ES', async ({ page }) => {
    await page.click('#tab-posts');
    // Default is EN (inherits main page language)
    const postTextarea = page.locator('#linkedin-post');
    expect(await postTextarea.inputValue()).toContain('Hi network');
    // Switch to ES via modal toggle
    await page.click('#modal-btn-es');
    expect(await postTextarea.inputValue()).toContain('Hola red');
    expect(await postTextarea.inputValue()).toContain('#TrabajoRemoto');
    // Switch back
    await page.click('#modal-btn-en');
    expect(await postTextarea.inputValue()).toContain('Hi network');
  });

  test('Copy button copies textarea content and shows feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.click('#tab-posts');
    const copyBtn = page.locator('#panel-posts .copy-btn');
    await copyBtn.click();
    await expect(copyBtn).toHaveText('Copied');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('Hi network');
  });

  test('Close button closes the modal', async ({ page }) => {
    await page.click('#btn-linkedin-close');
    await expect(page.locator('#linkedin-modal')).not.toHaveClass(/open/);
  });

  test('Escape key closes the modal', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('#linkedin-modal')).not.toHaveClass(/open/);
  });

  test('resize handle changes modal height on drag', async ({ page }) => {
    const box = page.locator('.linkedin-modal .box');
    const handle = page.locator('.resize-handle');
    const heightBefore = await box.boundingBox();
    expect(heightBefore).not.toBeNull();
    // Drag the resize handle down 80px
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2 + 80);
    await page.mouse.up();
    const heightAfter = await box.boundingBox();
    expect(heightAfter!.height).toBeGreaterThan(heightBefore!.height);
  });

  test('modal does not close when resizing (mousedown on handle, mouseup outside)', async ({ page }) => {
    const handle = page.locator('.resize-handle');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    await page.mouse.move(handleBox!.x + 50, handleBox!.y + 7);
    await page.mouse.down();
    await page.mouse.move(10, 10);
    await page.mouse.up();
    await expect(page.locator('#linkedin-modal')).toHaveClass(/open/);
  });
});