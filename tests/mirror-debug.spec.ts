/**
 * Mirror shader debug test — launch app, start game, load state 1, screenshot.
 * Does NOT create/delete profiles or clear data.
 */

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { SCREENSHOTS_DIR } from './helpers';

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');

test('Mirror shader visual check', async () => {
  const app = await electron.launch({
    args: [MAIN_JS, '--muted'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();
  
  // Capture console errors
  const errors: string[] = [];
  const logs: string[] = [];
  window.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.text().includes('CleanFrame')) logs.push(msg.text());
  });
  window.on('pageerror', err => errors.push(err.message));
  
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(2000);

  // Wait for profile screen and start game
  await window.waitForSelector('.fullscreen-layer .profile-hub', { timeout: 10_000 });
  const playBtn = window.locator('.profile-hub .btn--primary', { hasText: /Play/ });
  await playBtn.click({ timeout: 5000 });

  // Wait for game screen
  try {
    await window.waitForFunction(
      () => !document.querySelector('.fullscreen-layer'),
      { timeout: 20_000 },
    );
  } catch {
    // Take debug screenshot to see what state the app is in
    await window.screenshot({ path: join(SCREENSHOTS_DIR, 'mirror-debug-stuck.png') });
    console.log('Errors:', errors);
    const html = await window.evaluate(() => document.body.innerHTML.substring(0, 2000));
    console.log('Body HTML:', html);
    throw new Error('fullscreen-layer never disappeared. See mirror-debug-stuck.png');
  }
  await window.waitForSelector('.game-layer__canvas', { timeout: 10_000 });
  await window.waitForTimeout(3000); // let game initialize

  // Click the game layer to ensure keyboard focus
  await window.locator('.game-layer').click();
  await window.waitForTimeout(1000);

  // Load state directly via WASM module (F1 overlay flow unreliable in Playwright)
  const loaded = await window.evaluate(async () => {
    const mod = (window as any).__zelda3Module;
    if (!mod) return 'no-module';
    try {
      // Get profile ID
      const profiles = await (window as any).api.listProfiles();
      if (!profiles || profiles.length === 0) return 'no-profiles';
      const profileId = profiles[0].id;
      
      // Read state from disk
      const buffer = await (window as any).api.readState(profileId, 0);
      if (!buffer) return 'no-state-file';
      
      // Write to WASM FS and load
      mod.FS.writeFile('/saves/save0.sav', new Uint8Array(buffer));
      mod.ccall('WasmLoadState', null, ['number'], [0]);
      return 'loaded';
    } catch(e: any) { return 'error: ' + e.message; }
  });
  console.log('State load result:', loaded);
  await window.waitForTimeout(4000); // let game render after state load
  
  // Force the shader enabled (the overworld has no black edges in extended mode)
  await window.evaluate(() => { (window as any).__forceEdgeGlow = true; });
  await window.waitForTimeout(2000); // let a few frames render with shader on

  // Take intermediate screenshot to check if state loaded
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'mirror-debug-after-f1.png') });

  // Take full screenshot
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'mirror-debug.png') });
  
  // Log viewport info for debugging
  const vpInfo = await window.evaluate(() => {
    const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement;
    const fxCanvas = document.querySelector('.game-layer__fx-canvas') as HTMLCanvasElement;
    return {
      gameCanvas: canvas ? { w: canvas.width, h: canvas.height } : null,
      fxCanvas: fxCanvas ? { w: fxCanvas.width, h: fxCanvas.height } : null,
    };
  });
  console.log('Canvas info:', JSON.stringify(vpInfo));

  // Also take a clip of just the left boundary area (where mirror meets game)
  await window.screenshot({ 
    path: join(SCREENSHOTS_DIR, 'mirror-boundary.png'),
    clip: { x: 200, y: 200, width: 300, height: 400 }
  });
  console.log('Screenshots saved to tests/screenshots/');
  console.log('CleanFrame logs:', logs);
  console.log('Errors:', errors);

  await app.close();
});
