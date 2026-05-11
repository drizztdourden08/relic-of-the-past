/**
 * FPS counter test — verify the FPS display appears in the titlebar when enabled.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
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

test.describe('FPS Counter', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('FPS counter shows in titlebar when displayPerfInTitle is enabled', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    const { profileId } = await seedSingleProfile(window, TEST_ROMS.usa, 'FPS Test');

    // Enable displayPerfInTitle in profile settings
    await window.evaluate(
      ({ pid }) => window.api.writeConfig(pid, { displayPerfInTitle: true }),
      { pid: profileId },
    );

    // Reload so profile page shows with updated settings
    await window.reload();
    await window.waitForTimeout(2000);

    // Start the game
    await startGameFromProfile(window, 15_000);

    // FPS counter needs ~1 second to accumulate (counts frames per wall-clock second)
    // Wait up to 5 seconds for it to appear
    const fpsElement = window.locator('.titlebar__fps');
    await expect(fpsElement).toBeVisible({ timeout: 5_000 });
    const text = await fpsElement.textContent();
    expect(text).toMatch(/\d+ FPS/);
    console.log('FPS counter text:', text);

    await screenshot(window, 'fps-counter');
    await app.close();
  });
});
