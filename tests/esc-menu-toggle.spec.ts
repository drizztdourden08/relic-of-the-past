/**
 * ESC key behavior — verify ESC opens home from game view and closes any open page.
 */

import { test, expect } from '@playwright/test';
import {
  launchApp, clearAppData, seedSingleProfile, getScreen, waitForScreen,
  TEST_ROMS,
} from './helpers';
import type { ElectronApplication, Page } from 'playwright';

let app: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  await clearAppData();
  const launched = await launchApp();
  app = launched.app;
  window = launched.window;
  await window.waitForLoadState('domcontentloaded');
  await seedSingleProfile(window, TEST_ROMS.usa, 'TestProfile');
  await waitForScreen(window, 'profile');
});

test.afterAll(async () => {
  await app?.close();
});

test('ESC from profile page closes to game view', async () => {
  expect(await getScreen(window)).toBe('profile');
  await window.keyboard.press('Escape');
  await waitForScreen(window, 'game');
  expect(await getScreen(window)).toBe('game');
});

test('ESC from game view opens profile page', async () => {
  // Should be on game view after previous test
  expect(await getScreen(window)).toBe('game');
  await window.keyboard.press('Escape');
  await waitForScreen(window, 'profile');
  expect(await getScreen(window)).toBe('profile');
});

test('ESC toggles: open then close', async () => {
  // Close from profile
  await window.keyboard.press('Escape');
  await waitForScreen(window, 'game');
  // Open again
  await window.keyboard.press('Escape');
  await waitForScreen(window, 'profile');
  // Close again
  await window.keyboard.press('Escape');
  await waitForScreen(window, 'game');
  expect(await getScreen(window)).toBe('game');
});
