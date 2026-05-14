/**
 * Quick check: open Sprite Debug → filter to Drop sprites → screenshot.
 * Run with: npx playwright test tests/drop-sprite-check.spec.ts
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

test('drop sprites visual check', async () => {
  // Open the 3-dot menu (first IconButton with label="Menu")
  const menuBtn = window.locator('button[aria-label="Menu"]');
  await expect(menuBtn).toBeVisible({ timeout: 5000 });
  await menuBtn.click();
  await window.waitForTimeout(300);

  // Click "Sprite Debug" in the dropdown
  const spriteDebugItem = window.locator('.dropdown__item:has-text("Sprite Debug")');
  await expect(spriteDebugItem).toBeVisible({ timeout: 3000 });
  await spriteDebugItem.click();
  await window.waitForTimeout(500);

  // Click the "Drop" category tab to filter to drops only
  // The category buttons use CatBtn component — look for button text containing "Drop"
  const dropTab = window.locator('button:has-text("Drop")');
  await expect(dropTab).toBeVisible({ timeout: 5000 });
  await dropTab.click();
  await window.waitForTimeout(500);

  // Screenshot the drop sprites panel
  await window.screenshot({ path: 'tests/screenshots/drop-sprites-check.png', fullPage: true });

  // Verify that all 16 drop sprite images loaded (no broken images)
  const spriteImages = window.locator('img[src*="/sprites/items/drop-"]');
  const count = await spriteImages.count();
  console.log(`Found ${count} drop sprite images`);
  expect(count).toBe(16);

  // Check none are broken (naturalWidth > 0)
  for (let i = 0; i < count; i++) {
    const img = spriteImages.nth(i);
    const src = await img.getAttribute('src');
    const loaded = await img.evaluate((el: HTMLImageElement) => ({
      naturalWidth: el.naturalWidth,
      complete: el.complete,
      currentSrc: el.currentSrc,
    }));
    console.log(`  ${src}: w=${loaded.naturalWidth} complete=${loaded.complete} currentSrc=${loaded.currentSrc}`);
  }
});
