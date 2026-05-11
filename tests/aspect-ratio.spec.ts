/**
 * Manual aspect-ratio lock test.
 * Launches with existing profile data, loads save state 3, enables viewportConstraint: 'fit',
 * and checks for black bars by comparing canvas CSS dimensions to the container.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp,
  waitForScreen,
  startGameFromProfile,
  screenshot,
  TEST_ROMS,
} from './helpers';

test('aspect ratio lock eliminates black bars', async () => {
  test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

  // Launch WITHOUT clearing data — user has existing profiles
  const { app, window } = await launchApp({ muted: true });

  // Should land on profile page (single profile, last used)
  await waitForScreen(window, 'profile', 10_000);

  // Ensure profile uses 4:3 aspect ratio and normal window mode for deterministic test
  await window.evaluate(async () => {
    const profiles = await window.api.listProfiles();
    if (profiles.length > 0) {
      const config = await window.api.readConfig(profiles[0].id) || {};
      await window.api.writeConfig(profiles[0].id, { ...config, aspectRatio: '4:3', windowMode: 'default' });
    }
  });
  // Ensure window is not in fullscreen
  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win.isFullScreen()) win.setFullScreen(false);
  });

  // Start game
  await startGameFromProfile(window, 20_000);
  await window.waitForTimeout(3000);

  // Focus canvas and load save state 3 (F3 key, zero-indexed slot 2)
  const canvas = window.locator('.game-layer__canvas');
  await canvas.focus();
  await window.waitForTimeout(200);
  await window.keyboard.press('F3');
  await window.waitForTimeout(2000);

  // Take initial screenshot
  await screenshot(window, 'ratio-lock-before');

  // Check current canvas vs container dimensions BEFORE lock
  const beforeDims = await window.evaluate(() => {
    const container = document.querySelector('.game-layer') as HTMLElement;
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    if (!container || !cvs) return null;
    return {
      containerW: container.clientWidth,
      containerH: container.clientHeight,
      canvasStyleW: parseInt(cvs.style.width) || cvs.clientWidth,
      canvasStyleH: parseInt(cvs.style.height) || cvs.clientHeight,
      canvasBufferW: cvs.width,
      canvasBufferH: cvs.height,
    };
  });
  console.log('=== BEFORE lock ===');
  console.log(JSON.stringify(beforeDims, null, 2));

  // Enable viewportConstraint: 'fit' — get actual canvas ratio and titlebar height
  const canvasRatio = await window.evaluate(() => {
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    return cvs && cvs.width > 0 ? cvs.width / cvs.height : 4 / 3;
  });
  const titlebarHeight = await window.evaluate(() => {
    const tb = document.querySelector('.titlebar') as HTMLElement;
    return tb ? tb.offsetHeight : 0;
  });
  console.log(`Canvas ratio: ${canvasRatio}, titlebar: ${titlebarHeight}px`);

  // Trigger the lock via IPC (the real code path)
  await app.evaluate(({ BrowserWindow, ipcMain }, { ratio, extra }) => {
    const win = BrowserWindow.getAllWindows()[0];
    ipcMain.emit('window:setAspectRatioLock', {} as any, ratio, extra);
  }, { ratio: canvasRatio, extra: titlebarHeight });

  await window.waitForTimeout(2000);

  // Check window size from main process
  const windowSize = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return { size: win.getSize(), contentSize: win.getContentSize() };
  });
  console.log('=== Window size after lock ===');
  console.log(JSON.stringify(windowSize, null, 2));

  await window.waitForTimeout(1000);

  // Take screenshot after lock
  await screenshot(window, 'ratio-lock-after');

  // Check dimensions AFTER lock
  const afterDims = await window.evaluate(() => {
    const container = document.querySelector('.game-layer') as HTMLElement;
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    if (!container || !cvs) return null;
    return {
      containerW: container.clientWidth,
      containerH: container.clientHeight,
      canvasStyleW: parseInt(cvs.style.width) || cvs.clientWidth,
      canvasStyleH: parseInt(cvs.style.height) || cvs.clientHeight,
      canvasBufferW: cvs.width,
      canvasBufferH: cvs.height,
    };
  });
  console.log('=== AFTER lock ===');
  console.log(JSON.stringify(afterDims, null, 2));

  // Calculate black bar sizes
  if (afterDims) {
    const hBarTotal = afterDims.containerW - afterDims.canvasStyleW;
    const vBarTotal = afterDims.containerH - afterDims.canvasStyleH;
    console.log(`Horizontal black bars: ${hBarTotal}px total (${hBarTotal / 2}px each side)`);
    console.log(`Vertical black bars: ${vBarTotal}px total (${vBarTotal / 2}px each side)`);

    // After lock, there should be minimal/no black bars (tolerance of 2px for rounding)
    const maxBar = Math.max(hBarTotal, vBarTotal);
    console.log(`Max black bar: ${maxBar}px`);
    expect(maxBar).toBeLessThanOrEqual(2);
  }

  // Now test resize — resize the window and check again
  const windowSize2 = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.getSize();
  });
  console.log(`Window size: ${windowSize2[0]}x${windowSize2[1]}`);

  // Resize to a different width — the aspect ratio lock should maintain ratio
  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.setSize(900, win.getSize()[1]);
  });
  await window.waitForTimeout(500);

  const afterResizeDims = await window.evaluate(() => {
    const container = document.querySelector('.game-layer') as HTMLElement;
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    if (!container || !cvs) return null;
    return {
      containerW: container.clientWidth,
      containerH: container.clientHeight,
      canvasStyleW: parseInt(cvs.style.width) || cvs.clientWidth,
      canvasStyleH: parseInt(cvs.style.height) || cvs.clientHeight,
    };
  });
  console.log('=== AFTER resize to 900px width ===');
  console.log(JSON.stringify(afterResizeDims, null, 2));
  await screenshot(window, 'ratio-lock-after-resize');

  if (afterResizeDims) {
    const hBar = afterResizeDims.containerW - afterResizeDims.canvasStyleW;
    const vBar = afterResizeDims.containerH - afterResizeDims.canvasStyleH;
    console.log(`After resize - H bars: ${hBar}px, V bars: ${vBar}px`);
  }

  await app.close();
});
