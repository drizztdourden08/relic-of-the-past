/**
 * ROM management tests — import, duplicate detection, asset extraction, status reporting.
 * Requires: test-roms/ directory with .sfc files.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp, clearAppData, screenshot,
  importRom, deleteRom, extractAssets, checkAssets, loadAssetSize,
  listRoms, listRomsWithStatus,
  getLogEntries, printLogs,
  TEST_ROMS, ROM_FILES,
} from './helpers';

test.beforeEach(async () => {
  await clearAppData();
});

test.describe('ROM Import', () => {
  test('import a single ROM file', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    const result = await importRom(window, TEST_ROMS.usa);
    expect(result.success).toBe(true);
    expect(result.romFile).toBe(ROM_FILES.usa);
    expect(result.alreadyExists).toBeFalsy();

    const roms = await listRoms(window);
    expect(roms).toContain(ROM_FILES.usa);

    await app.close();
  });

  test('importing same ROM twice returns alreadyExists', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    const first = await importRom(window, TEST_ROMS.usa);
    expect(first.success).toBe(true);
    expect(first.alreadyExists).toBeFalsy();

    const second = await importRom(window, TEST_ROMS.usa);
    expect(second.success).toBe(true);
    expect(second.alreadyExists).toBe(true);
    expect(second.romFile).toBe(ROM_FILES.usa);

    // Should still be only 1 ROM in the list
    const roms = await listRoms(window);
    expect(roms.length).toBe(1);

    await app.close();
  });

  test('import multiple different ROMs', async () => {
    test.skip(!existsSync(TEST_ROMS.usa) || !existsSync(TEST_ROMS.canada), 'Test ROMs not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await importRom(window, TEST_ROMS.canada);

    const roms = await listRoms(window);
    expect(roms).toContain(ROM_FILES.usa);
    expect(roms).toContain(ROM_FILES.canada);
    expect(roms.length).toBe(2);

    await app.close();
  });
});

test.describe('Asset Extraction', () => {
  test('extract assets from imported ROM', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    const imp = await importRom(window, TEST_ROMS.usa);
    expect(imp.success).toBe(true);

    // Assets should not exist before extraction
    expect(await checkAssets(window, imp.romFile)).toBe(false);

    const result = await extractAssets(window, imp.romFile);
    expect(result.success).toBe(true);

    // Assets should exist after extraction
    expect(await checkAssets(window, imp.romFile)).toBe(true);

    // Asset data should be loadable and non-trivial
    const size = await loadAssetSize(window, imp.romFile);
    expect(size).toBeGreaterThan(100_000);
    console.log(`  Asset size: ${(size / 1024).toFixed(0)} KB`);

    const logs = await getLogEntries(window);
    printLogs(logs);

    await app.close();
  });

  test('extraction is idempotent (re-extract succeeds)', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    const imp = await importRom(window, TEST_ROMS.usa);
    const first = await extractAssets(window, imp.romFile);
    expect(first.success).toBe(true);
    const size1 = await loadAssetSize(window, imp.romFile);

    const second = await extractAssets(window, imp.romFile);
    expect(second.success).toBe(true);
    const size2 = await loadAssetSize(window, imp.romFile);

    expect(size2).toBe(size1);

    await app.close();
  });

  test('extraction fails gracefully for non-imported ROM', async () => {
    const { app, window } = await launchApp();

    const result = await extractAssets(window, 'nonexistent.sfc');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();

    await app.close();
  });
});

test.describe('ROM Status', () => {
  test('listRomsWithStatus reports correct asset state', async () => {
    test.skip(!existsSync(TEST_ROMS.usa) || !existsSync(TEST_ROMS.canada), 'Test ROMs not available');

    const { app, window } = await launchApp();

    // Import two ROMs, extract only one
    await importRom(window, TEST_ROMS.usa);
    await importRom(window, TEST_ROMS.canada);
    await extractAssets(window, ROM_FILES.usa);

    const statuses = await listRomsWithStatus(window);
    expect(statuses.length).toBe(2);

    const usa = statuses.find((r) => r.romFile === ROM_FILES.usa);
    const canada = statuses.find((r) => r.romFile === ROM_FILES.canada);

    expect(usa).toBeDefined();
    expect(usa!.hasAssets).toBe(true);
    expect(usa!.assetSize).toBeGreaterThan(0);

    expect(canada).toBeDefined();
    expect(canada!.hasAssets).toBe(false);
    expect(canada!.assetSize).toBeNull();

    await app.close();
  });
});

test.describe('ROM Deletion', () => {
  test('delete an imported ROM removes it from the list', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    expect(await listRoms(window)).toContain(ROM_FILES.usa);

    await deleteRom(window, ROM_FILES.usa);
    expect(await listRoms(window)).not.toContain(ROM_FILES.usa);

    await app.close();
  });

  test('deleting ROM also removes its cached assets', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);
    expect(await checkAssets(window, ROM_FILES.usa)).toBe(true);

    await deleteRom(window, ROM_FILES.usa);
    expect(await checkAssets(window, ROM_FILES.usa)).toBe(false);

    await app.close();
  });

  test('deleting ROM cascades to its profiles', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    // Create two profiles for this ROM
    await window.evaluate(
      ({ n, r }) => window.api.createProfile(n, r),
      { n: 'Profile A', r: ROM_FILES.usa },
    );
    await window.evaluate(
      ({ n, r }) => window.api.createProfile(n, r),
      { n: 'Profile B', r: ROM_FILES.usa },
    );

    const before = await window.evaluate(() => window.api.listProfiles());
    expect(before.length).toBe(2);

    await deleteRom(window, ROM_FILES.usa);

    const after = await window.evaluate(() => window.api.listProfiles());
    expect(after.length).toBe(0);

    await app.close();
  });

  test('deleting ROM does not affect other ROMs', async () => {
    test.skip(!existsSync(TEST_ROMS.usa) || !existsSync(TEST_ROMS.canada), 'Test ROMs not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await importRom(window, TEST_ROMS.canada);
    await extractAssets(window, ROM_FILES.usa);

    await deleteRom(window, ROM_FILES.usa);

    const roms = await listRoms(window);
    expect(roms).not.toContain(ROM_FILES.usa);
    expect(roms).toContain(ROM_FILES.canada);

    await app.close();
  });
});
