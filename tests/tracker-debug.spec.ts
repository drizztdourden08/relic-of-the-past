/**
 * Tracker debugging test — walks Link to chest, opens it, checks tracker state.
 */

import { test } from '@playwright/test';
import { join } from 'path';
import { _electron as electron } from 'playwright';

const PROJECT_ROOT = join(__dirname, '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'tests', 'screenshots');

test('Tracker chest debug', async () => {
  test.setTimeout(120_000);

  const app = await electron.launch({
    args: [MAIN_JS],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(2000);

  // Start game from profile page
  const screen = await window.evaluate(() => {
    if (document.querySelector('.fullscreen-layer .picker')) return 'picker';
    if (document.querySelector('.fullscreen-layer .profile-hub')) return 'profile';
    return 'other';
  });
  if (screen === 'profile') {
    await window.locator('.profile-hub .btn--primary', { hasText: /Play/ }).click();
  }
  await window.waitForFunction(() => !document.querySelector('.fullscreen-layer'), { timeout: 20_000 });
  await window.waitForSelector('.game-layer__canvas', { timeout: 10_000 });
  await window.waitForTimeout(5000);
  console.log('[DEBUG] Game is running');

  // ─── Helpers ───
  const pressKey = async (key: string, code: string, keyCode: number, durationMs = 100) => {
    await window.evaluate(([k, c, kc, dur]: any) => {
      const el = document.getElementById('canvas')!;
      el.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: c, keyCode: kc, which: kc, bubbles: true }));
      setTimeout(() => {
        el.dispatchEvent(new KeyboardEvent('keyup', { key: k, code: c, keyCode: kc, which: kc, bubbles: true }));
      }, dur);
    }, [key, code, keyCode, durationMs]);
    await window.waitForTimeout(durationMs + 50);
  };

  const holdDir = async (key: string, code: string, keyCode: number, ms: number) => {
    await window.evaluate(([k, c, kc, dur]: any) => {
      const el = document.getElementById('canvas')!;
      el.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: c, keyCode: kc, which: kc, bubbles: true }));
      setTimeout(() => {
        el.dispatchEvent(new KeyboardEvent('keyup', { key: k, code: c, keyCode: kc, which: kc, bubbles: true }));
      }, dur);
    }, [key, code, keyCode, ms]);
    await window.waitForTimeout(ms + 100);
  };

  // ─── Load save state 1 ───
  const canvas = window.locator('.game-layer__canvas');
  await canvas.focus();
  await window.keyboard.press('F1');
  await window.waitForTimeout(3000);
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'td-01-loaded.png') });

  // ─── Open tracker first so React component mounts and subscribes ───
  await window.click('[aria-label="Menu"]');
  await window.waitForTimeout(500);
  await window.locator('.dropdown__item', { hasText: 'Tracker' }).click();
  await window.waitForTimeout(2000);

  // Read tracker state BEFORE
  const before = await window.evaluate(() => ({
    summary: document.querySelector('.tracker-summary__stats')?.textContent ?? '(not visible)',
    inventory: document.querySelector('.tracker-view__inventory-items')?.textContent ?? '(not visible)',
  }));
  console.log('[DEBUG] BEFORE:', JSON.stringify(before));

  // ─── Simulate item received by calling __onItemReceived directly ───
  // item=0x12 (Lamp), method=1 (chest)
  const hookResult = await window.evaluate(() => {
    const fn = (window as any).__onItemReceived;
    if (!fn) return 'NO_HOOK';
    try {
      fn(0x12, 1);
      return 'CALLED';
    } catch (e: any) {
      return 'ERROR: ' + e.message;
    }
  });
  console.log('[DEBUG] __onItemReceived call:', hookResult);

  // Wait for React re-render
  await window.waitForTimeout(2000);

  // Read tracker state AFTER
  const after = await window.evaluate(() => ({
    summary: document.querySelector('.tracker-summary__stats')?.textContent ?? '(not visible)',
    inventory: document.querySelector('.tracker-view__inventory-items')?.textContent ?? '(not visible)',
  }));
  console.log('[DEBUG] AFTER:', JSON.stringify(after));

  // ─── Also test inventory polling ───
  const pollResult = await window.evaluate(() => {
    const mod = (window as any).__zelda3Module;
    if (!mod) return 'NO_MODULE';
    try {
      const ptr = mod.ccall('WasmGetInventoryState', 'number', [], []);
      if (!ptr) return 'NULL_PTR';
      const heap = mod.HEAPU8;
      if (!heap) return 'NO_HEAP';
      // Read first 34 bytes
      const data: number[] = [];
      for (let i = 0; i < 34; i++) data.push(heap[ptr + i]);
      return JSON.stringify(data);
    } catch (e: any) {
      return 'ERROR: ' + e.message;
    }
  });
  console.log('[DEBUG] Inventory poll result:', pollResult);

  // Dump tracker logs
  const logs = await window.evaluate(() => (window as any).__logEntries?.() ?? []);
  const trackerLogs = logs.filter((l: any) =>
    l.message.includes('[Tracker]') || l.message.includes('tracker') || l.message.includes('Item received')
  );
  console.log('[DEBUG] Tracker logs:');
  for (const l of trackerLogs) console.log(`  ${l.message}`);

  await app.close();
});
