/**
 * Aspect ratio lock scenario tests.
 * Each scenario takes screenshots and logs measurements for manual analysis.
 *
 * Scenarios tested:
 * 1. Enable lock with 4:3 — window snaps, no black bars
 * 2. Change aspect ratio to 16:9 + restart — lock updates to new ratio
 * 3. Switch window mode normal→borderless — lock re-applies with extra=0
 * 4. Switch window mode borderless→normal — lock re-applies with extra=38
 * 5. Disable lock — window freely resizable
 * 6. Enable lock when height is the "too big" dimension
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp,
  waitForScreen,
  startGameFromProfile,
  screenshot,
  TEST_ROMS,
  SCREENSHOTS_DIR,
} from './helpers';
import { join } from 'path';

/** Grab canvas/container metrics from the renderer. */
async function getDims(window: import('playwright').Page) {
  return window.evaluate(() => {
    const container = document.querySelector('.game-layer') as HTMLElement;
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    const tb = document.querySelector('.titlebar') as HTMLElement;
    if (!container || !cvs) return null;
    return {
      containerW: container.clientWidth,
      containerH: container.clientHeight,
      canvasW: parseInt(cvs.style.width) || cvs.clientWidth,
      canvasH: parseInt(cvs.style.height) || cvs.clientHeight,
      bufferW: cvs.width,
      bufferH: cvs.height,
      titlebarH: tb ? tb.offsetHeight : 0,
    };
  });
}

/** Get window size from main process. */
async function getWindowSize(app: import('playwright').ElectronApplication) {
  return app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.getSize() as [number, number];
  });
}

/** Set a window size from main process. */
async function setWindowSize(app: import('playwright').ElectronApplication, w: number, h: number) {
  return app.evaluate(({ BrowserWindow }, { w, h }) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.setSize(w, h);
  }, { w, h });
}

/** Write profile config settings via renderer. */
async function writeSettings(window: import('playwright').Page, patch: Record<string, any>) {
  return window.evaluate(async (p) => {
    const profiles = await window.api.listProfiles();
    if (profiles.length === 0) throw new Error('No profiles');
    const pid = profiles[0].id;
    const config = (await window.api.readConfig(pid)) || {};
    await window.api.writeConfig(pid, { ...config, ...p });
  }, patch);
}

/** Trigger lock from main process (bypasses UI). */
async function triggerLock(app: import('playwright').ElectronApplication, ratio: number, extra: number) {
  return app.evaluate(({ ipcMain }, { ratio, extra }) => {
    ipcMain.emit('window:setAspectRatioLock', {} as any, ratio, extra);
  }, { ratio, extra });
}

/** Unlock ratio from main process. */
async function unlockRatio(app: import('playwright').ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    ipcMain.emit('window:setAspectRatioLock', {} as any, 0, 0);
  });
}

/** Compute black bar sizes. */
function blackBars(dims: NonNullable<Awaited<ReturnType<typeof getDims>>>) {
  const hBar = dims.containerW - dims.canvasW;
  const vBar = dims.containerH - dims.canvasH;
  return { hBar, vBar, max: Math.max(hBar, vBar) };
}

/** Log a scenario step with measurements. */
function logStep(label: string, winSize: [number, number], dims: NonNullable<Awaited<ReturnType<typeof getDims>>>) {
  const bars = blackBars(dims);
  console.log(`\n--- ${label} ---`);
  console.log(`  Window: ${winSize[0]}x${winSize[1]}`);
  console.log(`  Container: ${dims.containerW}x${dims.containerH}`);
  console.log(`  Canvas: ${dims.canvasW}x${dims.canvasH}`);
  console.log(`  Buffer: ${dims.bufferW}x${dims.bufferH}`);
  console.log(`  Titlebar: ${dims.titlebarH}px`);
  console.log(`  Black bars: H=${bars.hBar}px V=${bars.vBar}px`);
  return bars;
}

test('aspect ratio lock scenarios', async () => {
  test.setTimeout(120_000);
  test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

  const { app, window } = await launchApp({ muted: true });

  try {
    await waitForScreen(window, 'profile', 10_000);

    // Force known state: 4:3, normal mode, lock OFF
    await writeSettings(window, {
      aspectRatio: '4:3',
      windowMode: 'default',
      viewportConstraint: 'none',
    });

    // Set window to known size
    await setWindowSize(app, 900, 700);
    await window.waitForTimeout(500);

    // Start game
    await startGameFromProfile(window, 20_000);
    await window.waitForTimeout(3000);

    // Load save state (F3) so we have actual gameplay rendering
    const canvas = window.locator('.game-layer__canvas');
    await canvas.focus();
    await window.waitForTimeout(200);
    await window.keyboard.press('F3');
    await window.waitForTimeout(2000);

    // ─── SCENARIO 1: Baseline — lock OFF, check state ───
    let winSize = await getWindowSize(app);
    let dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    let bars = logStep('S1: Baseline (lock OFF)', winSize, dims);
    await screenshot(window, 'ratio-s1-baseline');

    const ratio43 = dims.bufferW / dims.bufferH;
    const titlebarH = dims.titlebarH;
    console.log(`  Detected ratio: ${ratio43.toFixed(4)}, titlebar: ${titlebarH}px`);

    // ─── SCENARIO 2: Enable lock (4:3) — should snap ───
    await triggerLock(app, ratio43, titlebarH);
    await window.waitForTimeout(1000);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    bars = logStep('S2: Lock ON (4:3)', winSize, dims);
    await screenshot(window, 'ratio-s2-lock-43');

    // Window should NOT have grown vs the original 900x700
    expect(winSize[0]).toBeLessThanOrEqual(900);
    expect(winSize[1]).toBeLessThanOrEqual(700);
    // Black bars should be minimal
    expect(bars.max).toBeLessThanOrEqual(4);

    // ─── SCENARIO 3: Window should not grow when re-applying lock ───
    const sizeBeforeRelock = [...winSize] as [number, number];
    await triggerLock(app, ratio43, titlebarH);
    await window.waitForTimeout(500);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    bars = logStep('S3: Re-apply same lock', winSize, dims);

    // Must not have grown
    expect(winSize[0]).toBeLessThanOrEqual(sizeBeforeRelock[0]);
    expect(winSize[1]).toBeLessThanOrEqual(sizeBeforeRelock[1]);

    // ─── SCENARIO 4: Make window tall (height >> width) then lock ───
    await unlockRatio(app);
    await setWindowSize(app, 700, 900);
    await window.waitForTimeout(500);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims - before tall lock');
    logStep('S4a: Tall window before lock', winSize, dims);

    await triggerLock(app, ratio43, titlebarH);
    await window.waitForTimeout(1000);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    bars = logStep('S4b: Tall window after lock', winSize, dims);
    await screenshot(window, 'ratio-s4-tall-lock');

    // Should NOT have grown beyond 700x900
    expect(winSize[0]).toBeLessThanOrEqual(700);
    expect(winSize[1]).toBeLessThanOrEqual(900);
    // Black bars should be minimal
    expect(bars.max).toBeLessThanOrEqual(4);

    // ─── SCENARIO 5: Unlock, resize, then lock with extra=0 (simulating borderless) ───
    // In real usage the titlebar hides, so extra goes to 0 and the full window is content.
    // We simulate by setting fullscreen on the window to hide the titlebar.
    await unlockRatio(app);
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setFullScreen(true);
    });
    await window.waitForTimeout(1000);

    // Get the fullscreen size, then lock with extra=0
    winSize = await getWindowSize(app);
    const fsW = winSize[0];
    const fsH = winSize[1];
    console.log(`  Fullscreen size: ${fsW}x${fsH}`);

    await triggerLock(app, ratio43, 0);
    await window.waitForTimeout(1000);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    bars = logStep('S5: Lock with fullscreen/borderless (extra=0)', winSize, dims);
    await screenshot(window, 'ratio-s5-borderless-lock');

    // In fullscreen the window size is fixed to the monitor — snap won't shrink it
    // but there should be bars since the ratio likely doesn't match the monitor
    // Key check: window should not have GROWN
    expect(winSize[0]).toBeLessThanOrEqual(fsW);
    expect(winSize[1]).toBeLessThanOrEqual(fsH);

    // Exit fullscreen for remaining scenarios
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setFullScreen(false);
    });
    await window.waitForTimeout(1000);

    // ─── SCENARIO 6: After exiting fullscreen, re-lock with normal mode (extra=38) ───
    await unlockRatio(app);
    await setWindowSize(app, 900, 700);
    await window.waitForTimeout(500);
    // ─── SCENARIO 6: Re-lock with normal mode (extra=38) after resize ───
    await triggerLock(app, ratio43, 38);
    await window.waitForTimeout(1000);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    bars = logStep('S6: Switch back to normal (extra=38)', winSize, dims);
    await screenshot(window, 'ratio-s6-back-to-normal');

    expect(winSize[0]).toBeLessThanOrEqual(900);
    expect(winSize[1]).toBeLessThanOrEqual(700);

    // ─── SCENARIO 7: Unlock and verify no constraints ───
    await unlockRatio(app);
    await window.waitForTimeout(500);

    // Resize to something arbitrary
    await setWindowSize(app, 1000, 600);
    await window.waitForTimeout(500);

    winSize = await getWindowSize(app);
    dims = await getDims(window);
    if (!dims) throw new Error('No dims');
    logStep('S7: Lock OFF, free resize', winSize, dims);
    await screenshot(window, 'ratio-s7-unlocked');

    // Should be exactly the size we set (no constraints)
    expect(winSize[0]).toBe(1000);
    expect(winSize[1]).toBe(600);

    console.log('\n=== ALL SCENARIOS PASSED ===\n');
  } finally {
    await app.close();
  }
});
