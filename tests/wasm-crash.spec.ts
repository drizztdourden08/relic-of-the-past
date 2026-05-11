/**
 * WASM stability tests.
 *
 * Verifies:
 *  - Game starts and remains running through the intro sequence
 *  - No WASM crashes or RuntimeError leaks
 *  - Crash handler correctly logs a crash if one occurs (single message, no flooding)
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

test.describe('WASM Stability', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('game runs through intro without crashing', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const setup = await launchApp({ muted: true, noFocus: true });
    await seedSingleProfile(setup.window, TEST_ROMS.usa, 'Stability Test');
    await setup.app.close();

    const { app, window } = await launchApp({ muted: true, noFocus: true });
    await waitForScreen(window, 'profile', 15_000);

    console.log('  Starting game...');
    await startGameFromProfile(window, 15_000);

    // Verify the game started running
    let logs = await getLogEntries(window);
    const runningLog = logs.find((e) => e.message.includes('WASM module running'));
    expect(runningLog).toBeDefined();
    console.log('  ✓ Game started running');

    // Let the intro play for 60 seconds — the old bug crashed at ~46s
    console.log('  Letting intro run for 60s...');
    await window.waitForTimeout(60_000);

    logs = await getLogEntries(window);
    printLogs(logs);
    await screenshot(window, 'stability-after-60s');

    // Verify no crashes occurred
    const crashes = logs.filter((e) => e.message.includes('WASM crashed'));
    console.log(`  Crash messages: ${crashes.length}`);
    expect(crashes.length).toBe(0);

    // Verify no RuntimeError leaks
    const runtimeErrors = logs.filter(
      (e) => e.message.includes('RuntimeError') && !e.message.includes('WASM crashed'),
    );
    console.log(`  RuntimeError leaks: ${runtimeErrors.length}`);
    expect(runtimeErrors.length).toBe(0);

    console.log('  ✓ Game survived intro without crash');
    await app.close();
  });

  test('crash handler logs exactly once if crash occurs', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp({ muted: true, noFocus: true });
    await seedSingleProfile(window, TEST_ROMS.usa, 'Handler Test');
    await app.close();

    const run = await launchApp({ muted: true, noFocus: true });
    await waitForScreen(run.window, 'profile', 15_000);
    await startGameFromProfile(run.window, 15_000);

    // Run for 20 seconds — if a crash happens, verify handler behavior
    await run.window.waitForTimeout(20_000);

    const logs = await getLogEntries(run.window);
    const crashes = logs.filter((e) => e.message.includes('WASM crashed'));

    if (crashes.length > 0) {
      // If a crash did occur, verify it was exactly one (no flooding)
      console.log(`  Crash occurred: ${crashes[0].message}`);
      expect(crashes.length).toBe(1);

      // Verify stack trace was logged
      const stackLines = logs.filter(
        (e) => e.channel === 'error' && e.message.trim().startsWith('at '),
      );
      expect(stackLines.length).toBeGreaterThan(0);
      console.log(`  ✓ Crash logged once with ${stackLines.length} stack frames`);

      // Wait 5s more — no flooding
      await run.window.waitForTimeout(5000);
      const finalLogs = await getLogEntries(run.window);
      const finalCrashes = finalLogs.filter((e) => e.message.includes('WASM crashed'));
      expect(finalCrashes.length).toBe(1);
      console.log('  ✓ No crash flooding');
    } else {
      console.log('  ✓ No crash occurred (expected after timing fix)');
    }

    await run.app.close();
  });
});
