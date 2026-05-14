/**
 * F-key passthrough test
 *
 * Verifies that every F1–F12 key reaches the renderer's DOM keydown handler
 * when running inside Electron.  A red overlay flashes for 600 ms whenever
 * the key is detected, and a screenshot is captured to prove it fired.
 */

import { test, expect } from '@playwright/test';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  waitForScreen,
  TEST_ROMS,
  SCREENSHOTS_DIR,
} from './helpers';
import { join } from 'path';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let win: Page;

test.beforeAll(async () => {
  await clearAppData();
  ({ app, window: win } = await launchApp());
  await seedSingleProfile(win, TEST_ROMS.usa, 'FKeyTest');
});

test.afterAll(async () => {
  await app?.close();
  await clearAppData();
});

/**
 * Inject a global keydown listener that shows a huge red overlay
 * with the key name whenever ANY key fires.  The overlay auto-hides
 * after 600 ms.
 */
async function injectRedOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Don't inject twice
    if (document.getElementById('fkey-test-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fkey-test-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '999999',
      background: 'rgba(255, 0, 0, 0.85)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      color: '#fff',
      fontSize: '72px',
      fontWeight: '900',
      fontFamily: 'monospace',
      textShadow: '0 0 20px #000',
    });
    overlay.appendChild(label);
    document.body.appendChild(overlay);

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        label.textContent = e.code;
        overlay.style.display = 'flex';
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          overlay.style.display = 'none';
        }, 600);
      },
      { capture: true },
    );
  });
}

/** Wait for the red overlay to be visible and capture a screenshot. */
async function captureKeyScreenshot(page: Page, keyName: string): Promise<boolean> {
  // Press the key
  await page.keyboard.press(keyName);
  // Give it a moment for the overlay to show
  await page.waitForTimeout(100);

  // Check if overlay is visible
  const visible = await page.evaluate(() => {
    const el = document.getElementById('fkey-test-overlay');
    return el?.style.display === 'flex';
  });

  // Capture screenshot regardless
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, `fkey-${keyName}.png`),
  });

  // Wait for overlay to hide before next test
  await page.waitForTimeout(700);
  return visible;
}

test.describe('F-key passthrough', () => {
  test('all F1–F12 keys reach the renderer DOM', async () => {
    // Navigate to profile hub (not playing the game — just testing key delivery)
    await waitForScreen(win, 'profile');
    await injectRedOverlay(win);

    const results: Record<string, boolean> = {};

    for (let i = 1; i <= 12; i++) {
      const key = `F${i}`;
      results[key] = await captureKeyScreenshot(win, key);
    }

    console.log('\n=== F-key passthrough results ===');
    for (const [key, ok] of Object.entries(results)) {
      console.log(`  ${key}: ${ok ? '✅ PASS' : '❌ FAIL'}`);
    }

    // ALL F-keys must reach the renderer
    for (let i = 1; i <= 12; i++) {
      expect(results[`F${i}`], `F${i} did not reach the renderer`).toBe(true);
    }
  });

  test('other commonly intercepted keys reach the renderer', async () => {
    await injectRedOverlay(win);

    // Keys that Chromium/Electron might intercept:
    // Tab, Escape, Backspace, Space, Enter
    const keysToTest = ['Tab', 'Escape', 'Space'];
    const results: Record<string, boolean> = {};

    for (const key of keysToTest) {
      results[key] = await captureKeyScreenshot(win, key);
    }

    console.log('\n=== Other key passthrough results ===');
    for (const [key, ok] of Object.entries(results)) {
      console.log(`  ${key}: ${ok ? '✅ PASS' : '❌ FAIL'}`);
    }

    // These should all work
    for (const key of keysToTest) {
      expect(results[key], `${key} did not reach the renderer`).toBe(true);
    }
  });
});
