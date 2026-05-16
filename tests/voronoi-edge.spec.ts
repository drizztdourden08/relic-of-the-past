/**
 * Voronoi edge test — loads state 1 (close to edge) and state 3 (further from edge)
 * to verify the voronoi effect doesn't shift/cut with camera movement.
 */

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { SCREENSHOTS_DIR } from './helpers';

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');

test('Voronoi edge stability across camera positions', async () => {
  const app = await electron.launch({
    args: [MAIN_JS, '--muted'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();

  const errors: string[] = [];
  window.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  window.on('pageerror', err => errors.push(err.message));

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
    await window.screenshot({ path: join(SCREENSHOTS_DIR, 'voronoi-stuck.png') });
    throw new Error('Game never started');
  }
  await window.waitForSelector('.game-layer__canvas', { timeout: 10_000 });
  await window.waitForTimeout(3000);
  await window.locator('.game-layer').click();
  await window.waitForTimeout(1000);

  // Wait for WASM module to be ready
  await window.waitForFunction(
    () => !!(window as any).__zelda3Module?.ccall,
    { timeout: 15_000 },
  );
  await window.waitForTimeout(1000);

  // Helper to load a state slot and screenshot
  async function loadAndScreenshot(slot: number, name: string) {
    const result = await window.evaluate(async (s) => {
      const mod = (window as any).__zelda3Module;
      if (!mod) return 'no-module';
      try {
        const profiles = await (window as any).api.listProfiles();
        if (!profiles || profiles.length === 0) return 'no-profiles';
        const profileId = profiles[0].id;
        const buffer = await (window as any).api.readState(profileId, s);
        if (!buffer) return 'no-state-file-' + s;
        mod.FS.writeFile('/saves/save0.sav', new Uint8Array(buffer));
        mod.ccall('WasmLoadState', null, ['number'], [0]);
        return 'loaded';
      } catch (e: any) { return 'error: ' + e.message; }
    }, slot);
    console.log(`State ${slot} load: ${result}`);
    if (result !== 'loaded') {
      throw new Error(`Failed to load state ${slot}: ${result}`);
    }
    // Let several frames render
    await window.waitForTimeout(3000);
    await window.screenshot({ path: join(SCREENSHOTS_DIR, `voronoi-state${slot}-${name}.png`) });
    
    // Also get viewport info for debugging
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
          extraLeftRight: view.getUint8(2),
          extraLeftCur: view.getUint8(3),
          extraRightCur: view.getUint8(4),
          extraBottomCur: view.getUint8(5),
          snesWidth: view.getUint16(6, true),
          snesHeight: view.getUint16(8, true),
        };
      } catch { return null; }
    });
    console.log(`State ${slot} viewport:`, JSON.stringify(vpInfo));
    return vpInfo;
  }

  // Load state 0 (close to edge)
  const vp0 = await loadAndScreenshot(0, 'close-to-edge');
  
  // Crop the right boundary region (where game meets effect)
  const rightBound = 852 - (vp0?.extraRightCur || 85) * 2;
  await window.screenshot({
    path: join(SCREENSHOTS_DIR, 'voronoi-boundary-right-state0.png'),
    clip: { x: rightBound - 40, y: 150, width: 200, height: 400 }
  });
  
  // Load state 2 (further from edge)
  const vp2 = await loadAndScreenshot(2, 'further-from-edge');
  
  // Crop the left boundary region
  const leftBound = (vp2?.extraLeftCur || 42) * 2;
  await window.screenshot({
    path: join(SCREENSHOTS_DIR, 'voronoi-boundary-left-state2.png'),
    clip: { x: leftBound - 40, y: 150, width: 200, height: 400 }
  });
  
  // Crop the right boundary for state 2 (should match state 0)
  await window.screenshot({
    path: join(SCREENSHOTS_DIR, 'voronoi-boundary-right-state2.png'),
    clip: { x: rightBound - 40, y: 150, width: 200, height: 400 }
  });

  console.log('Errors:', errors);
  await app.close();
});
