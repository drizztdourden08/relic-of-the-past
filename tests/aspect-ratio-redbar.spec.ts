/**
 * Aspect ratio lock — real UI flow test with RED background for black bar visibility.
 * GameLayer background is set to RED so any "black bars" show up as red.
 * 
 * If you see ANY red in the game area, the ratio lock is broken for that scenario.
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

async function measure(window: import('playwright').Page) {
  return window.evaluate(() => {
    const container = document.querySelector('.game-layer') as HTMLElement;
    const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    if (!container || !cvs) return null;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const canW = parseInt(cvs.style.width) || cvs.clientWidth;
    const canH = parseInt(cvs.style.height) || cvs.clientHeight;
    return {
      containerW: cW, containerH: cH,
      canvasW: canW, canvasH: canH,
      bufferW: cvs.width, bufferH: cvs.height,
      hBars: cW - canW,
      vBars: cH - canH,
    };
  });
}

async function getWinSize(app: import('playwright').ElectronApplication) {
  return app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getSize() as [number, number]);
}

test('ratio lock - real UI flow with red background', async () => {
  test.setTimeout(180_000);
  test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

  const { app, window } = await launchApp({ muted: true });

  try {
    await waitForScreen(window, 'profile', 10_000);

    // Force known state via API
    await window.evaluate(async () => {
      const profiles = await window.api.listProfiles();
      if (profiles.length > 0) {
        await window.api.writeConfig(profiles[0].id, {
          aspectRatio: '4:3',
          windowMode: 'default',
          viewportConstraint: 'fit',
          extendY: true,
        });
      }
    });

    // Set known window size
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setSize(900, 700);
    });
    await window.waitForTimeout(500);

    // ════════════════════════════════════════════
    // SCENARIO A: Start game with lock ALREADY enabled
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO A: Start game with lock already ON ═══');

    await startGameFromProfile(window, 25_000);
    // Wait for canvas to render + ratio lock to apply (the poll effect)
    await window.waitForTimeout(4000);

    let size = await getWinSize(app);
    let m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-A-start-with-lock');

    // ════════════════════════════════════════════
    // SCENARIO B: Open profile, go to settings, turn lock OFF
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO B: Disable lock via UI ═══');

    // Press ESC to open profile
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    // Click Settings tab
    await window.locator('.profile-hub__tab', { hasText: 'Settings' }).click();
    await window.waitForTimeout(500);

    // Find the "Lock to Game Ratio" toggle and click it OFF
    const lockToggle = window.locator('.toggle', { hasText: /Lock to Game Ratio/ });
    await lockToggle.click();
    await window.waitForTimeout(500);

    // Close profile overlay (ESC)
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-B-lock-off');

    // Now resize the window wider — should show red bars since lock is off
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setSize(1100, 700);
    });
    await window.waitForTimeout(500);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  After resize to 1100x700:`);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-B2-lock-off-wide');

    // ════════════════════════════════════════════
    // SCENARIO C: Turn lock back ON via UI (while game is running)
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO C: Enable lock via UI (game running) ═══');

    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    await window.locator('.profile-hub__tab', { hasText: 'Settings' }).click();
    await window.waitForTimeout(500);

    // Toggle lock ON
    const lockToggle2 = window.locator('.toggle', { hasText: /Lock to Game Ratio/ });
    await lockToggle2.click();
    await window.waitForTimeout(2000); // Wait for snap

    // Close profile
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-C-lock-on-again');

    // CRITICAL CHECK: should NOT see red. Window should have snapped.
    // Window must not have grown beyond 1100x700
    expect(size[0]).toBeLessThanOrEqual(1100);
    expect(size[1]).toBeLessThanOrEqual(700);

    // ════════════════════════════════════════════
    // SCENARIO D: Change window mode to borderless (lock stays on)
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO D: Switch to borderless ═══');

    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    await window.locator('.profile-hub__tab', { hasText: 'Settings' }).click();
    await window.waitForTimeout(500);

    // Click "Borderless" in the Window Mode segmented control
    const borderlessBtn = window.locator('.segmented__btn', { hasText: /Borderless/i });
    await borderlessBtn.scrollIntoViewIfNeeded();
    await borderlessBtn.click();
    await window.waitForTimeout(2000);

    // Close profile overlay
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-D-borderless');

    // ════════════════════════════════════════════
    // SCENARIO E: Switch back to normal mode (lock stays on)
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO E: Switch back to normal ═══');

    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    await window.locator('.profile-hub__tab', { hasText: 'Settings' }).click();
    await window.waitForTimeout(500);

    const normalBtn = window.locator('.segmented__btn', { hasText: /Normal/i });
    await normalBtn.scrollIntoViewIfNeeded();
    await normalBtn.click();
    await window.waitForTimeout(2000);

    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-E-back-to-normal');

    // ════════════════════════════════════════════
    // SCENARIO F: Stop game, change aspect ratio, restart
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO F: Change aspect ratio + restart ═══');

    // Open profile, stop game
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);

    const stopBtn = window.locator('.profile-hub .btn--danger', { hasText: /Stop/ });
    await stopBtn.click();
    await window.waitForTimeout(1000);

    // Switch to settings, change aspect ratio to 16:9
    await window.locator('.profile-hub__tab', { hasText: 'Settings' }).click();
    await window.waitForTimeout(500);

    const ratio169 = window.locator('.radio-group__option', { hasText: /16:9/ });
    await ratio169.click();
    await window.waitForTimeout(500);

    // Go back to Home tab and start game
    await window.locator('.profile-hub__tab', { hasText: 'Home' }).click();
    await window.waitForTimeout(500);

    const playBtn = window.locator('.profile-hub .btn--primary', { hasText: /Play/ });
    await playBtn.click();
    await window.waitForTimeout(5000); // Wait for game to start + ratio lock

    // Close profile if still open
    const profileHub = window.locator('.fullscreen-layer .profile-hub');
    if (await profileHub.isVisible().catch(() => false)) {
      await window.keyboard.press('Escape');
      await window.waitForTimeout(1000);
    }

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-F-169-after-restart');

    // ════════════════════════════════════════════
    // SCENARIO G: Make window tall (height > width ratio), lock should shrink height
    // ════════════════════════════════════════════
    console.log('\n═══ SCENARIO G: Tall window with lock ═══');

    // Unlock, resize tall, re-lock
    await app.evaluate(({ ipcMain }) => {
      ipcMain.emit('window:setAspectRatioLock', {} as any, 0, 0);
    });
    await window.waitForTimeout(300);
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setSize(700, 900);
    });
    await window.waitForTimeout(500);

    // Now trigger lock with current buffer ratio
    const bufferRatio = await window.evaluate(() => {
      const cvs = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
      return cvs ? cvs.width / cvs.height : 0;
    });
    const titlebarH = await window.evaluate(() => {
      const tb = document.querySelector('.titlebar') as HTMLElement;
      return tb ? tb.offsetHeight : 0;
    });
    console.log(`  Buffer ratio: ${bufferRatio}, titlebar: ${titlebarH}`);

    await app.evaluate(({ ipcMain }, { ratio, extra }) => {
      ipcMain.emit('window:setAspectRatioLock', {} as any, ratio, extra);
    }, { ratio: bufferRatio, extra: titlebarH });
    await window.waitForTimeout(1000);

    size = await getWinSize(app);
    m = await measure(window);
    console.log(`  Window: ${size[0]}x${size[1]}`);
    console.log(`  ${JSON.stringify(m)}`);
    await screenshot(window, 'redbar-G-tall-window');

    // Must NOT have grown
    expect(size[0]).toBeLessThanOrEqual(700);
    expect(size[1]).toBeLessThanOrEqual(900);

    console.log('\n═══ ALL SCENARIOS CAPTURED ═══');
  } finally {
    await app.close();
  }
});
