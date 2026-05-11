/**
 * Game loading tests — WASM initialization, config/assets on virtual FS, game loop running.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  getScreen,
  waitForScreen,
  startGameFromProfile,
  getLogEntries,
  printLogs,
  screenshot,
  TEST_ROMS,
} from './helpers';

test.describe('Game Loading', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('WASM initializes and enters running state', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'Run Test');

    // Single profile → shows profile page on reload → start game
    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 15_000);
    await window.waitForTimeout(3000);

    const logs = await getLogEntries(window);

    // Verify the full init sequence completed
    expect(logs.find((l) => l.message.includes('Initializing WASM'))).toBeDefined();
    expect(logs.find((l) => l.message.includes('Writing assets to virtual FS'))).toBeDefined();
    expect(logs.find((l) => l.message.includes('zelda3 WASM starting'))).toBeDefined();
    expect(logs.find((l) => l.message.includes('WASM module running'))).toBeDefined();

    // No WASM crash
    const crash = logs.find((l) => l.message.includes('WASM failed'));
    expect(crash).toBeUndefined();

    printLogs(logs);
    await app.close();
  });

  test('config file is loaded without warnings', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'Config Test');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 15_000);
    await window.waitForTimeout(3000);

    const logs = await getLogEntries(window);

    // Should NOT have the "Unable to read config" warning anymore
    const configWarning = logs.find((l) => l.message.includes('Unable to read config'));
    expect(configWarning).toBeUndefined();

    printLogs(logs);
    await app.close();
  });

  test('virtual FS has expected files after init', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'FS Test');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 15_000);
    await window.waitForTimeout(3000);

    const fsInfo = await window.evaluate(() => {
      const mod = (window as any).__zelda3Module;
      if (!mod?.FS) return null;
      return {
        hasAssets: mod.FS.analyzePath('/zelda3_assets.dat').exists as boolean,
        hasConfig: mod.FS.analyzePath('/zelda3.ini').exists as boolean,
        hasSavesDir: mod.FS.analyzePath('/saves').exists as boolean,
      };
    });

    expect(fsInfo).not.toBeNull();
    expect(fsInfo!.hasAssets).toBe(true);
    expect(fsInfo!.hasConfig).toBe(true);
    expect(fsInfo!.hasSavesDir).toBe(true);

    await app.close();
  });

  test('game renders frames to canvas', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'Render Test');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 15_000);

    // Wait for a few frames to render
    await window.waitForTimeout(3000);

    // Check that the canvas has non-black pixels (game is rendering)
    const hasContent = await window.evaluate(() => {
      const canvas = document.querySelector('canvas.game-layer__canvas') as HTMLCanvasElement;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Check if there are any non-black pixels
      let nonBlack = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 10 || pixels[i + 1] > 10 || pixels[i + 2] > 10) {
          nonBlack++;
        }
      }
      return nonBlack > 100; // At least some non-black pixels
    });

    await screenshot(window, 'game-rendering');
    expect(hasContent).toBe(true);

    await app.close();
  });
});
