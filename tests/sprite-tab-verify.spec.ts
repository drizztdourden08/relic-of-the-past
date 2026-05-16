/**
 * Quick test: launch app, go to Data Manager → Sprites tab, screenshot.
 * Run with: npx playwright test tests/sprite-tab-verify.ts
 */
import { test, expect } from '@playwright/test';
import { launchApp } from './helpers';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  ({ app, window } = await launchApp({ muted: true }));
});

test.afterAll(async () => {
  await app?.close();
});

test('sprites tab loads and displays images', async () => {
  // Open the menu
  const menuBtn = window.locator('button[aria-label="Menu"]');
  await expect(menuBtn).toBeVisible({ timeout: 5000 });
  await menuBtn.click();
  await window.waitForTimeout(300);

  // Click "ROMs" to open data manager
  const romsItem = window.locator('[class*="dropdown"] [class*="item"]', { hasText: 'ROMs' });
  await expect(romsItem).toBeVisible({ timeout: 3000 });
  await romsItem.click();
  await window.waitForTimeout(500);

  // Click the Sprites tab
  const spritesTab = window.getByRole('button', { name: 'Sprites' });
  await expect(spritesTab).toBeVisible({ timeout: 3000 });
  await spritesTab.click();
  await window.waitForTimeout(1000);

  // Screenshot
  await window.screenshot({ path: 'tests/screenshots/sprites-tab.png' });

  // Check the spritesBaseUrl
  const baseUrl = await window.evaluate(() => (window as any).api?.spritesBaseUrl);
  console.log('spritesBaseUrl =', baseUrl);

  // Check if sprite card images loaded
  const imgInfo = await window.evaluate(() => {
    const imgs = document.querySelectorAll('img[class*="sprite"]');
    let loaded = 0;
    let broken = 0;
    const srcs: string[] = [];
    imgs.forEach(img => {
      const el = img as HTMLImageElement;
      if (el.naturalWidth > 0) loaded++;
      else broken++;
      if (srcs.length < 3) srcs.push(el.src);
    });
    return { total: imgs.length, loaded, broken, srcs };
  });
  console.log('Sprite images:', JSON.stringify(imgInfo, null, 2));

  // We expect some sprites to be visible (extraction was done)
  expect(imgInfo.total).toBeGreaterThan(0);
});
