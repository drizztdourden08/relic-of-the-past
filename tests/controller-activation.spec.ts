/**
 * Controller Activation Tests
 *
 * Verifies that when Chromium fires gamepadconnected for ALL gamepads at once
 * (which happens when ANY single gamepad gets a button press), only the gamepad
 * with actual input gets marked as "activated".
 *
 * Uses Playwright to mock the Gamepad API inside the Electron renderer.
 * Note: We can't construct real GamepadEvent (requires native Gamepad instance),
 * so we dispatch a plain Event('gamepadconnected') with a .gamepad property.
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
  await seedSingleProfile(window, TEST_ROMS.usa, 'Activation Test');
});

test.afterAll(async () => {
  await app?.close();
});

test.describe('Controller Activation', () => {
  test('only the gamepad with actual input gets activated when both appear', async () => {
    // Navigate to profile hub
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
    if (await controlsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await controlsTab.click();
      await window.waitForTimeout(500);
    }

    // Mock Gamepad API and fire events simulating the Chromium "all gamepads appear at once" bug.
    // Xbox at index 0 has button pressed; Switch at index 1 does not.
    const result = await window.evaluate(() => {
      const makeButtons = (hasInput: boolean) =>
        Array.from({ length: 16 }, (_, i) => ({
          pressed: hasInput && i === 0,
          touched: hasInput && i === 0,
          value: (hasInput && i === 0) ? 1.0 : 0,
        }));

      const makeGamepad = (index: number, id: string, hasInput: boolean) => ({
        id,
        index,
        connected: true,
        timestamp: performance.now(),
        mapping: 'standard',
        axes: [0, 0, 0, 0],
        buttons: makeButtons(hasInput),
        hapticActuators: [],
        vibrationActuator: null,
      });

      // Xbox has button pressed, Switch does not
      const gamepads = [
        makeGamepad(0, 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)', true),
        makeGamepad(1, 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', false),
        null,
        null,
      ];

      // Override navigator.getGamepads
      Object.defineProperty(navigator, 'getGamepads', {
        value: () => gamepads,
        writable: true,
        configurable: true,
      });

      // Fire gamepadconnected for both — simulating Chromium behavior.
      // Use Object.assign(new Event(...), { gamepad }) since GamepadEvent rejects plain objects.
      for (const gp of gamepads) {
        if (!gp) continue;
        const event = Object.assign(new Event('gamepadconnected'), { gamepad: gp });
        window.dispatchEvent(event);
      }

      return new Promise<{ xboxActivated: boolean; switchActivated: boolean }>((resolve) => {
        setTimeout(() => {
          const cards = document.querySelectorAll('.device-card');
          const results: { name: string; activated: boolean }[] = [];
          cards.forEach((card) => {
            const name = card.querySelector('.device-card__name')?.textContent ?? '';
            const dot = card.querySelector('.device-card__status');
            const isGreen = dot?.classList.contains('device-card__status--active') ?? false;
            results.push({ name, activated: isGreen });
          });

          const xbox = results.find(r => r.name.toLowerCase().includes('xbox'));
          const switchCtrl = results.find(r => r.name.toLowerCase().includes('switch'));

          resolve({
            xboxActivated: xbox?.activated ?? false,
            switchActivated: switchCtrl?.activated ?? false,
          });
        }, 600);
      });
    });

    // Xbox should be activated (green), Switch should NOT (yellow = detected only)
    expect(result.xboxActivated).toBe(true);
    expect(result.switchActivated).toBe(false);
  });

  test('switch gets activated when its button is pressed', async () => {
    // Now simulate the Switch being pressed (index 1 has input)
    const result = await window.evaluate(() => {
      const makeButtons = (hasInput: boolean) =>
        Array.from({ length: 16 }, (_, i) => ({
          pressed: hasInput && i === 0,
          touched: hasInput && i === 0,
          value: (hasInput && i === 0) ? 1.0 : 0,
        }));

      const makeGamepad = (index: number, id: string, hasInput: boolean) => ({
        id,
        index,
        connected: true,
        timestamp: performance.now(),
        mapping: 'standard',
        axes: [0, 0, 0, 0],
        buttons: makeButtons(hasInput),
        hapticActuators: [],
        vibrationActuator: null,
      });

      // Now Switch has input
      const gamepads = [
        makeGamepad(0, 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)', false),
        makeGamepad(1, 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', true),
        null,
        null,
      ];

      Object.defineProperty(navigator, 'getGamepads', {
        value: () => gamepads,
        writable: true,
        configurable: true,
      });

      // Fire gamepadconnected for the Switch
      const event = Object.assign(new Event('gamepadconnected'), { gamepad: gamepads[1] });
      window.dispatchEvent(event);

      return new Promise<{ switchActivated: boolean }>((resolve) => {
        setTimeout(() => {
          const cards = document.querySelectorAll('.device-card');
          const results: { name: string; activated: boolean }[] = [];
          cards.forEach((card) => {
            const name = card.querySelector('.device-card__name')?.textContent ?? '';
            const dot = card.querySelector('.device-card__status');
            const isGreen = dot?.classList.contains('device-card__status--active') ?? false;
            results.push({ name, activated: isGreen });
          });

          const switchCtrl = results.find(r => r.name.toLowerCase().includes('switch'));
          resolve({ switchActivated: switchCtrl?.activated ?? false });
        }, 600);
      });
    });

    expect(result.switchActivated).toBe(true);
  });
});
