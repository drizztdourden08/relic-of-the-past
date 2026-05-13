/**
 * Binding Remap Tests
 *
 * Verifies that:
 * 1. Clicking a binding row opens the BindingListener modal
 * 2. Pressing a key captures the new binding
 * 3. The binding label updates in the UI
 */

import { test, expect } from '@playwright/test';
import {
  launchApp,
  clearAppData,
  seedSingleProfile,
  TEST_ROMS,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  await clearAppData();
  ({ app, window } = await launchApp());
  await seedSingleProfile(window, TEST_ROMS.usa, 'Remap Test');
});

test.afterAll(async () => {
  await app?.close();
});

test.describe('Binding Remap', () => {
  test('remapping updates the binding label in the UI', async () => {
    // Navigate to profile hub if not already there
    const screen = await window.evaluate(() => {
      if (document.querySelector('.fullscreen-layer .profile-hub')) return 'profile';
      if (document.querySelector('.game-layer__canvas')) return 'game';
      return 'other';
    });
    if (screen === 'game') {
      await window.keyboard.press('Escape');
      await window.waitForTimeout(1000);
    }

    // Click Controls tab
    const controlsTab = window.locator('text=Controls');
    await controlsTab.waitFor({ state: 'visible', timeout: 5000 });
    await controlsTab.click();
    await window.waitForTimeout(500);

    // Find the first binding row and read its label
    const firstRow = window.locator('.binding-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 3000 });
    const originalLabel = await firstRow.locator('.binding-row__binding-label').textContent();

    // Click the row to open BindingListener
    await firstRow.click();
    await window.waitForTimeout(200);

    // Verify BindingListener modal appeared
    const listener = window.locator('.binding-listener');
    await expect(listener).toBeVisible({ timeout: 2000 });

    // Press a different key (KeyQ) to capture
    await window.keyboard.press('q');
    await window.waitForTimeout(300);

    // Verify the modal closed
    await expect(listener).not.toBeVisible({ timeout: 2000 });

    // Verify the binding label updated (should now show "Q" or derived from KeyQ)
    const newLabel = await firstRow.locator('.binding-row__binding-label').textContent();
    expect(newLabel).not.toBe(originalLabel);
    expect(newLabel).toBe('Q');
  });

  test('pressing Escape cancels the remap', async () => {
    // Find the second binding row
    const row = window.locator('.binding-row').nth(1);
    await row.waitFor({ state: 'visible', timeout: 3000 });
    const originalLabel = await row.locator('.binding-row__binding-label').textContent();

    // Click to open BindingListener
    await row.click();
    await window.waitForTimeout(200);

    const listener = window.locator('.binding-listener');
    await expect(listener).toBeVisible({ timeout: 2000 });

    // Press Escape to cancel
    await window.keyboard.press('Escape');
    await window.waitForTimeout(300);

    // Modal closed
    await expect(listener).not.toBeVisible({ timeout: 2000 });

    // Label should remain unchanged
    const currentLabel = await row.locator('.binding-row__binding-label').textContent();
    expect(currentLabel).toBe(originalLabel);
  });
});
