/**
 * Save State tests — verify F-key save/load state round-trip and SRAM persistence.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
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

test.describe('Save States', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('Shift+F1 saves state to disk and F1 loads it back', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true });
    const { profileId } = await seedSingleProfile(window, TEST_ROMS.usa, 'SaveTest');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 20_000);
    // Let game run a bit for meaningful state
    await window.waitForTimeout(4000);

    const canvas = window.locator('.game-layer__canvas');
    await canvas.focus();
    await window.waitForTimeout(200);

    // --- Save state to slot 0 ---
    await window.keyboard.press('Shift+F1');
    await window.waitForTimeout(1000);

    let logs = await getLogEntries(window);
    const saveLogs = logs.filter(l => l.message.includes('[SaveState]'));
    console.log('=== Save logs ===');
    for (const l of saveLogs) console.log(`  ${l.message}`);

    expect(saveLogs.some(l => l.message.includes('ccall returned'))).toBe(true);
    expect(saveLogs.some(l => l.message.includes('persisted to disk'))).toBe(true);

    // Verify file exists on disk
    const savesDir = join(USER_DATA_PATH, 'profiles', profileId, 'saves');
    const files = await readdir(savesDir);
    console.log('Files in saves dir:', files);
    expect(files).toContain('save0.sav');

    // --- Load state from slot 0 ---
    await canvas.focus();
    await window.keyboard.press('F1');
    await window.waitForTimeout(1000);

    logs = await getLogEntries(window);
    const loadLogs = logs.filter(l => l.message.includes('[LoadState]'));
    console.log('=== Load logs ===');
    for (const l of loadLogs) console.log(`  ${l.message}`);

    expect(loadLogs.some(l => l.message.includes('ccall returned'))).toBe(true);
    expect(loadLogs.some(l => l.message.includes('state loaded'))).toBe(true);

    // --- Verify game is still running ---
    const gameStatus = await window.evaluate(() => {
      const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
      return { exists: !!canvas, focused: document.activeElement === canvas };
    });
    expect(gameStatus.exists).toBe(true);

    await screenshot(window, 'save-state-roundtrip');
    await app.close();
  });

  test('SRAM persists across app restarts', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true });
    const { profileId } = await seedSingleProfile(window, TEST_ROMS.usa, 'SramTest');

    await window.reload();
    await window.waitForTimeout(2000);
    await startGameFromProfile(window, 20_000);
    // Let game run so SRAM sync triggers (every 5s)
    await window.waitForTimeout(8000);

    let logs = await getLogEntries(window);
    const sramLogs = logs.filter(l => l.message.includes('[SRAM]'));
    console.log('=== SRAM logs ===');
    for (const l of sramLogs) console.log(`  ${l.message}`);

    // Check sram.dat exists on disk
    const savesDir = join(USER_DATA_PATH, 'profiles', profileId, 'saves');
    const files = await readdir(savesDir);
    console.log('Files in saves dir:', files);

    // At least sram.dat or sram.bak should exist
    const hasSram = files.includes('sram.dat') || files.includes('sram.bak');
    expect(hasSram).toBe(true);

    await app.close();

    // --- Relaunch and verify SRAM is loaded ---
    const { app: app2, window: win2 } = await launchApp({ muted: true });
    await win2.waitForTimeout(2000);
    await startGameFromProfile(win2, 20_000);
    await win2.waitForTimeout(3000);

    logs = await getLogEntries(win2);
    const loadLogs = logs.filter(l => l.message.includes('Loaded SRAM from profile'));
    console.log('=== SRAM load on restart ===');
    for (const l of loadLogs) console.log(`  ${l.message}`);

    expect(loadLogs.length).toBeGreaterThan(0);

    printLogs(logs);
    await app2.close();
  });
});
