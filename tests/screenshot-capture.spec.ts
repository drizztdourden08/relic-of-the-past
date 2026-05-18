/**
 * Screenshot capture test — verify save state creates a valid PNG on disk
 * AND that the overlay UI displays it correctly.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  waitForScreen,
  startGameFromProfile,
  getLogEntries,
  printLogs,
  screenshot,
  TEST_ROMS,
} from './helpers';

const USER_DATA_PATH = join(
  process.env.APPDATA ?? join(process.env.HOME ?? '', 'AppData', 'Roaming'),
  'relic-of-the-past',
);

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test.describe('Save State Screenshots', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('save state screenshot is saved to disk and displayed in overlay', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true });
    const { profileId } = await seedSingleProfile(window, TEST_ROMS.usa, 'ScreenshotTest');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 20_000);
    // Let game render several frames
    await window.waitForTimeout(5000);

    // --- Trigger save state via Shift+F1 ---
    const canvas = window.locator('.game-layer__canvas');
    await canvas.focus();
    await window.waitForTimeout(200);
    await window.keyboard.press('Shift+F1');
    await window.waitForTimeout(2000);

    // --- Verify PNG on disk ---
    const savesDir = join(USER_DATA_PATH, 'profiles', profileId, 'saves');
    const files = await readdir(savesDir);
    console.log('Files in saves dir:', files);
    expect(files).toContain('save0.png');

    const pngData = await readFile(join(savesDir, 'save0.png'));
    console.log(`PNG file size: ${pngData.byteLength} bytes`);
    expect(pngData.byteLength).toBeGreaterThan(1000);
    expect(Buffer.compare(pngData.subarray(0, 8), PNG_HEADER)).toBe(0);

    const width = pngData.readUInt32BE(16);
    const height = pngData.readUInt32BE(20);
    console.log(`PNG dimensions: ${width}x${height}`);
    expect(width).toBe(512);
    expect(height).toBe(448);

    // --- Open the save state overlay ---
    const saveStatesBtn = window.locator('[aria-label="Save States"]');
    await expect(saveStatesBtn).toBeVisible({ timeout: 3000 });
    await saveStatesBtn.click();
    await window.waitForTimeout(1000);

    // --- Verify the overlay is visible ---
    const overlay = window.locator('.save-overlay');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // --- Verify slot 0's card has an <img> with a blob: src ---
    const slot0Card = overlay.locator('.save-slot').first();
    await expect(slot0Card).toBeVisible();

    const slot0Img = slot0Card.locator('.save-slot__img');
    const imgVisible = await slot0Img.isVisible().catch(() => false);
    console.log(`Slot 0 screenshot <img> visible: ${imgVisible}`);

    if (!imgVisible) {
      // Debug: dump what's inside the card
      const cardHtml = await slot0Card.innerHTML();
      console.log('=== Slot 0 card HTML ===');
      console.log(cardHtml);

      // Check if the readScreenshot IPC actually returns data
      const readResult = await window.evaluate(async (pid: string) => {
        const b64 = await window.api.readScreenshot(pid, 0);
        return {
          isNull: b64 === null || b64 === undefined,
          type: typeof b64,
          length: b64 ? b64.length : 0,
        };
      }, profileId);
      console.log('readScreenshot result:', JSON.stringify(readResult));

      // Check slotInfos
      const slotInfos = await window.evaluate((pid: string) => window.api.getSlotInfos(pid), profileId);
      console.log('Slot infos:', JSON.stringify(slotInfos));
    }

    // Take a screenshot of the overlay for visual inspection
    await screenshot(window, 'screenshot-overlay-display');

    // The image MUST be visible with a data: URL src and actually loaded
    await expect(slot0Img).toBeVisible({ timeout: 2000 });
    const imgSrc = await slot0Img.getAttribute('src');
    console.log(`Slot 0 img src prefix: ${imgSrc?.substring(0, 30)}...`);
    expect(imgSrc).toBeTruthy();
    expect(imgSrc).toMatch(/^data:image\/png;base64,/);

    // Verify the image actually loaded (naturalWidth > 0 means decoded OK)
    const imgNatural = await slot0Img.evaluate((el: HTMLImageElement) => ({
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      complete: el.complete,
    }));
    console.log(`Slot 0 img natural size: ${imgNatural.naturalWidth}x${imgNatural.naturalHeight}, complete: ${imgNatural.complete}`);
    expect(imgNatural.complete).toBe(true);
    expect(imgNatural.naturalWidth).toBeGreaterThan(0);
    expect(imgNatural.naturalHeight).toBeGreaterThan(0);

    const logs = await getLogEntries(window);
    printLogs(logs);
    await app.close();
  });
});
