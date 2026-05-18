/**
 * Stale Device Detection Test
 *
 * Verifies that when a HID device is opened but stops sending reports,
 * the DeviceCard shows a STALE overlay after 2 seconds.
 */

import { test, expect } from '@playwright/test';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  TEST_ROMS,
  SCREENSHOTS_DIR,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';
import { join } from 'path';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  await clearAppData();
  ({ app, window } = await launchApp());
  await seedSingleProfile(window, TEST_ROMS.usa, 'Stale Test');
});

test.afterAll(async () => {
  await app?.close();
});

test('HID device with no reports shows STALE overlay', async () => {
  // Wait for the profile hub to appear (app lands here after seed with single profile)
  await window.waitForSelector('.fullscreen-layer .profile-hub', { timeout: 10_000 }).catch(async () => {
    // If we're in game, press Escape to go back to profile hub
    await window.keyboard.press('Escape');
    await window.waitForSelector('.fullscreen-layer .profile-hub', { timeout: 10_000 });
  });

  // Click Controls tab
  const controlsTab = window.locator('.profile-hub__tab-label', { hasText: 'Controls' });
  await controlsTab.waitFor({ state: 'visible', timeout: 5000 });
  await controlsTab.click();
  await window.waitForTimeout(500);

  // Inject a fake stale HID device via the exposed globals
  await window.evaluate(() => {
    const reader = (window as any).__webHidReader;
    const mgr = (window as any).__inputManager;
    if (!reader || !mgr) throw new Error('Globals not ready');

    // Simulate device opened — sets lastReportTime to now
    reader.markDeviceOpened('057e:2073', 'GameCube Controller');

    // Force lastReportTime to 5 seconds ago so it's immediately stale
    const lastReportMap = (reader as any).lastReportTime as Map<string, number>;
    lastReportMap.set('057e:2073', performance.now() - 5000);

    // Trigger device refresh so UI picks it up
    mgr.refreshDevices();
  });

  // Wait for the UI to update (refreshDevices notifies listeners synchronously)
  await window.waitForTimeout(2000);

  // Take screenshot
  await window.screenshot({ path: join(SCREENSHOTS_DIR, 'stale-device-test.png') });

  // Check for the stale overlay
  const staleOverlay = window.locator('.device-card__stale-label');
  const count = await staleOverlay.count();

  expect(count).toBeGreaterThan(0);
  const text = await staleOverlay.first().textContent();
  expect(text).toBe('STALE');
});
