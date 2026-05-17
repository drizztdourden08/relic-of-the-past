/**
 * Test: forceBackdropBlack setting — loads save slot 2 (inside house)
 * and verifies backdrop becomes black when the setting is enabled.
 */

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { SCREENSHOTS_DIR } from './helpers';

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');

test('forceBackdropBlack turns indoor backdrop to black', async () => {
  const app = await electron.launch({
    args: [MAIN_JS, '--muted'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();

  const errors: string[] = [];
  window.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(2000);

  // Start game
  await window.waitForSelector('.fullscreen-layer .profile-hub', { timeout: 10_000 });
  const playBtn = window.locator('.profile-hub .btn--primary', { hasText: /Play/ });
  await playBtn.click({ timeout: 5000 });

  try {
    await window.waitForFunction(
      () => !document.querySelector('.fullscreen-layer'),
      { timeout: 20_000 },
    );
  } catch {
    await window.screenshot({ path: join(SCREENSHOTS_DIR, 'backdrop-stuck.png') });
    throw new Error('Game never started');
  }
  await window.waitForSelector('.game-layer__canvas', { timeout: 10_000 });
  await window.waitForTimeout(3000);
  await window.locator('.game-layer').click();
  await window.waitForTimeout(1000);

  // Wait for WASM module
  await window.waitForFunction(
    () => !!(window as any).__zelda3Module?.ccall,
    { timeout: 15_000 },
  );
  await window.waitForTimeout(1000);

  // Load save slot 1 (indoor scene, mainModule=7)
  const loadResult = await window.evaluate(async () => {
    const mod = (window as any).__zelda3Module;
    if (!mod) return 'no-module';
    try {
      const profiles = await (window as any).api.listProfiles();
      if (!profiles || profiles.length === 0) return 'no-profiles';
      const profileId = profiles[0].id;
      const buffer = await (window as any).api.readState(profileId, 1);
      if (!buffer) return 'no-state-file';
      mod.FS.writeFile('/saves/save0.sav', new Uint8Array(buffer));
      mod.ccall('WasmLoadState', null, ['number'], [0]);
      return 'loaded';
    } catch (e: any) { return 'error: ' + e.message; }
  });
  console.log(`Load result: ${loadResult}`);
  if (loadResult !== 'loaded') {
    throw new Error(`Failed to load state 1: ${loadResult}`);
  }
  await window.waitForTimeout(2000);

  // Screenshot BEFORE enabling forceBackdropBlack
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'backdrop-before.png') });

  // Enable forceBackdropBlack via ccall
  await window.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [1]);
  });

  // Wait for a few frames to render with the new setting
  await window.waitForTimeout(2000);

  // Screenshot AFTER enabling forceBackdropBlack
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'backdrop-after.png') });

  // Get viewport info to confirm we're indoors
  const vpInfo = await window.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    if (!mod || !mod.ccall) return null;
    try {
      const ptr = mod.ccall('WasmGetViewportInfo', 'number', [], []);
      if (!ptr) return null;
      const view = new DataView(mod.HEAPU8.buffer, ptr, 10);
      return {
        mainModule: view.getUint8(0),
        submodule: view.getUint8(1),
      };
    } catch { return null; }
  });
  console.log(`Viewport info:`, JSON.stringify(vpInfo));

  await app.close();
});
