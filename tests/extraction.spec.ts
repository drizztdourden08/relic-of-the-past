// Playwright test: extract assets from a real ROM and verify the full pipeline.
// Requires: test-roms/zelda3.sfc at project root, Python 3 + pillow + pyyaml on PATH.

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync } from 'fs';

const ROM_PATH = join(__dirname, '..', 'test-roms', 'zelda3.sfc');
const PROJECT_ROOT = join(__dirname, '..');

test('extract assets from ROM and launch game', async () => {
  // Skip if no ROM available
  if (!existsSync(ROM_PATH)) {
    test.skip();
    return;
  }

  const app = await electron.launch({
    args: [join(PROJECT_ROOT, 'dist', 'electron', 'main.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const window = await app.firstWindow();

  // Collect logs from both console and IPC
  const allLogs: string[] = [];
  window.on('console', (msg) => {
    allLogs.push(`[console.${msg.type()}] ${msg.text()}`);
  });
  window.on('pageerror', (err) => {
    allLogs.push(`[PAGE ERROR] ${err.message}`);
  });

  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(1000);

  // Verify no cached assets
  const hasAssetsBefore = await window.evaluate(() => window.api.checkAssets());
  console.log(`Assets cached before: ${hasAssetsBefore}`);

  // Call extractAssets directly with the ROM path (bypasses file dialog)
  console.log('\n=== Starting extraction ===');
  console.log(`ROM: ${ROM_PATH}`);

  const result = await window.evaluate(
    (romPath) => window.api.extractAssets(romPath),
    ROM_PATH,
  );

  console.log(`Extraction result: ${JSON.stringify(result)}`);

  // Wait a moment for IPC logs to arrive
  await window.waitForTimeout(1000);

  // Pull LogBus entries
  const logEntries = await window.evaluate(() => {
    return (window as any).__logEntries?.() ?? [];
  });

  console.log('\n=== LogBus Entries ===');
  for (const e of logEntries) {
    console.log(`[${e.channel}/${e.level}] ${e.message}`);
  }

  // Verify assets were created
  const hasAssetsAfter = await window.evaluate(() => window.api.checkAssets());
  console.log(`\nAssets cached after: ${hasAssetsAfter}`);

  // Verify ROM was copied to userData
  const hasRom = await window.evaluate(() => window.api.checkRom());
  console.log(`ROM stored: ${hasRom}`);

  if (result.success) {
    // Load the assets and verify size
    const buffer = await window.evaluate(() =>
      window.api.loadAssets().then((b: ArrayBuffer | null) => b?.byteLength ?? 0),
    );
    console.log(`Assets size: ${(buffer / 1024).toFixed(0)} KB`);

    expect(buffer).toBeGreaterThan(100_000); // Should be several MB
  }

  // Take screenshot
  await window.screenshot({ path: 'tests/screenshots/extraction.png' });

  // Print any console errors
  const errors = allLogs.filter((l) => l.includes('ERROR') || l.includes('error'));
  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    for (const e of errors) console.log(e);
  }

  expect(result.success).toBe(true);

  await app.close();
});
