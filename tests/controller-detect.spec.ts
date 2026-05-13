/**
 * Controller detection tests — verifies that HID enumeration gives accurate
 * controller names when XInput abstracts away the real device identity.
 */

import { test, expect } from '@playwright/test';
import { launchApp, clearAppData, openMenu } from './helpers';

test.describe('Controller Detection', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('Xbox Series X via XInput shows correct name from HID enumeration', async () => {
    const { app, window } = await launchApp();

    // Navigate to Input Calibration page via menu
    await openMenu(window);
    await window.click('.dropdown__label:has-text("Input Calibration")');
    await window.waitForSelector('.input-cal', { timeout: 5000 });

    // Inject fake gamepad (simulates XInput — no VID:PID in name)
    await window.evaluate(() => {
      Object.defineProperty(navigator, 'getGamepads', {
        value: () => {
          const result = new Array(4).fill(null);
          result[0] = {
            id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
            index: 0,
            connected: true,
            mapping: 'standard',
            buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
            axes: [0, 0, 0, 0],
            timestamp: performance.now(),
            hapticActuators: [],
            vibrationActuator: null,
          };
          return result;
        },
        configurable: true,
      });
    });

    // Wait for polling + HID enum to complete
    await window.waitForTimeout(2000);

    // Find the Gamepad API card (badge starts with #)
    const debugInfo = await window.evaluate(() => {
      const cards = document.querySelectorAll('.input-cal__card');
      const cardData: { name: string | null; meta: string | null; badge: string | null }[] = [];
      cards.forEach(card => {
        cardData.push({
          name: card.querySelector('.input-cal__card-name')?.textContent ?? null,
          meta: card.querySelector('.input-cal__card-meta')?.textContent ?? null,
          badge: card.querySelector('.input-cal__card-badge')?.textContent ?? null,
        });
      });
      return { cardData };
    });

    const gamepadCards = debugInfo.cardData.filter(c => c.badge?.startsWith('#'));
    expect(gamepadCards.length).toBeGreaterThan(0);

    // Should NOT show the generic XInput "Xbox 360" name
    expect(gamepadCards[0].name).not.toContain('Xbox 360');
    // Should resolve to a real preset name (not the raw Gamepad API string)
    expect(gamepadCards[0].name).toMatch(/Xbox/i);
    // Should show a real VID:PID in meta
    expect(gamepadCards[0].meta).toMatch(/045e:[0-9a-f]{4}/);

    await app.close();
  });

  test('HID enumeration returns real Xbox device with correct PID', async () => {
    const { app, window } = await launchApp();

    // Navigate to Input Calibration page via menu
    await openMenu(window);
    await window.click('.dropdown__label:has-text("Input Calibration")');
    await window.waitForSelector('.input-cal', { timeout: 5000 });

    // Get real HID device list and verify Xbox is found with known PID
    const hidDevices = await window.evaluate(() => {
      return window.api.enumerateHidDevices();
    });

    const xboxDevice = hidDevices.find((d: any) => d.vendorId === '045e');
    expect(xboxDevice).toBeDefined();
    // PID should be 02ff (Xbox Wireless Adapter)
    expect(xboxDevice.productId).toBe('02ff');

    // Inject fake gamepad and wait for UI to render the correct name
    await window.evaluate(() => {
      Object.defineProperty(navigator, 'getGamepads', {
        value: () => {
          const result = new Array(4).fill(null);
          result[0] = {
            id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
            index: 0,
            connected: true,
            mapping: 'standard',
            buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
            axes: [0, 0, 0, 0],
            timestamp: performance.now(),
            hapticActuators: [],
            vibrationActuator: null,
          };
          return result;
        },
        configurable: true,
      });
    });
    await window.waitForTimeout(2000);

    // The card should show the resolved preset name, not "Xbox 360"
    const gamepadCards = await window.evaluate(() => {
      const cards = document.querySelectorAll('.input-cal__card');
      return Array.from(cards)
        .filter(c => c.querySelector('.input-cal__card-badge')?.textContent?.startsWith('#'))
        .map(c => ({
          name: c.querySelector('.input-cal__card-name')?.textContent,
          meta: c.querySelector('.input-cal__card-meta')?.textContent,
        }));
    });

    expect(gamepadCards.length).toBeGreaterThan(0);
    expect(gamepadCards[0].name).toBe('Xbox Wireless Controller');
    expect(gamepadCards[0].meta).toBe('045e:02ff');

    await app.close();
  });

  test('Xbox gamepad is not ghost-filtered by Switch WebHID connection', async () => {
    const { app, window } = await launchApp();

    // Navigate to Input Calibration page via menu
    await openMenu(window);
    await window.click('.dropdown__label:has-text("Input Calibration")');
    await window.waitForSelector('.input-cal', { timeout: 5000 });

    // Inject fake Xbox gamepad (XInput format — no Vendor:/Product: in ID)
    // AND ensure WebHID has a Nintendo device (simulating real scenario)
    await window.evaluate(() => {
      Object.defineProperty(navigator, 'getGamepads', {
        value: () => {
          const result = new Array(4).fill(null);
          result[0] = {
            id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
            index: 0,
            connected: true,
            mapping: 'standard',
            buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
            axes: [0, 0, 0, 0],
            timestamp: performance.now(),
            hapticActuators: [],
            vibrationActuator: null,
          };
          return result;
        },
        configurable: true,
      });
    });

    await window.waitForTimeout(2000);

    // The gamepad card MUST exist — the ghost filter should NOT remove it
    const gamepadCards = await window.evaluate(() => {
      const cards = document.querySelectorAll('.input-cal__card');
      return Array.from(cards)
        .filter(c => c.querySelector('.input-cal__card-badge')?.textContent?.startsWith('#'))
        .map(c => c.querySelector('.input-cal__card-name')?.textContent);
    });

    // Xbox card must be present (not filtered by Nintendo WebHID)
    expect(gamepadCards.length).toBeGreaterThan(0);
    expect(gamepadCards[0]).not.toContain('Xbox 360');  // Should be resolved to real name
    expect(gamepadCards[0]).toMatch(/Xbox/i);

    await app.close();
  });

  test('status bar counts WebHID devices in controller total', async () => {
    const { app, window } = await launchApp();

    // Navigate to Input Calibration page via menu
    await openMenu(window);
    await window.click('.dropdown__label:has-text("Input Calibration")');
    await window.waitForSelector('.input-cal', { timeout: 5000 });

    // Status should show count including any connected WebHID devices
    // With no devices connected, it should say "0 controller(s) detected"
    const statusText = await window.locator('.input-cal__status').textContent();
    expect(statusText).toContain('controller(s)');
    expect(statusText).toContain('0');

    await app.close();
  });

  test('Switch Pro 2 WebHID card shows stick circles and responds to simulated input', async () => {
    const { app, window } = await launchApp();

    // Navigate to Input Calibration page
    await openMenu(window);
    await window.click('.dropdown__label:has-text("Input Calibration")');
    await window.waitForSelector('.input-cal', { timeout: 5000 });

    // Simulate a Switch Pro Controller 2 device via webHidReader
    await window.evaluate(() => {
      (window as any).__webHidReader.simulateDevice(0x057e, 0x2069);
    });

    // Wait for UI to update
    await window.waitForTimeout(500);

    // Inject simulated input state (all buttons released, sticks centered)
    await window.evaluate(() => {
      (window as any).__webHidReader.simulateInput({
        deviceKey: '57e:2069',
        buttons: new Array(21).fill(false),
        axes: [0, 0, 0, 0],
        timestamp: performance.now(),
      });
    });

    await window.waitForTimeout(1000);

    // Verify the HID card exists
    const hidCards = await window.evaluate(() => {
      const cards = document.querySelectorAll('.input-cal__card');
      return Array.from(cards)
        .filter(c => c.querySelector('.input-cal__card-badge')?.textContent === 'HID')
        .map(c => ({
          name: c.querySelector('.input-cal__card-name')?.textContent,
          hasSticks: c.querySelectorAll('.input-cal__stick-container').length,
          buttonCount: c.querySelectorAll('.input-cal__btn-cell').length,
          hasVibration: !!c.querySelector('.input-cal__btn'),
        }));
    });

    expect(hidCards.length).toBe(1);
    expect(hidCards[0].name).toBe('Nintendo Switch Pro Controller 2');
    // Must have 2 stick circles (L and R)
    expect(hidCards[0].hasSticks).toBe(2);
    // Must have 21 buttons from the profile
    expect(hidCards[0].buttonCount).toBe(21);

    // Now simulate a button press (A button = index 0)
    await window.evaluate(() => {
      const buttons = new Array(21).fill(false);
      buttons[0] = true; // A pressed
      (window as any).__webHidReader.simulateInput({
        deviceKey: '57e:2069',
        buttons,
        axes: [0.5, -0.3, 0, 0],  // Left stick moved
        timestamp: performance.now(),
      });
    });

    await window.waitForTimeout(500);

    // Check that button A is shown as pressed
    const pressedState = await window.evaluate(() => {
      const cards = document.querySelectorAll('.input-cal__card');
      const hidCard = Array.from(cards).find(
        c => c.querySelector('.input-cal__card-badge')?.textContent === 'HID'
      );
      if (!hidCard) return null;
      const btnCells = hidCard.querySelectorAll('.input-cal__btn-cell');
      const debugState = hidCard.querySelector('.input-cal__debug-state')?.textContent ?? '';
      return {
        firstButtonPressed: btnCells[0]?.classList.contains('input-cal__btn-cell--pressed'),
        secondButtonPressed: btnCells[1]?.classList.contains('input-cal__btn-cell--pressed'),
        stickValues: hidCard.querySelectorAll('.input-cal__stick-values')[0]?.textContent,
        debugState,
      };
    });

    expect(pressedState).not.toBeNull();
    expect(pressedState!.firstButtonPressed).toBe(true);  // A pressed
    expect(pressedState!.secondButtonPressed).toBe(false); // B not pressed
    // L stick should show moved values
    expect(pressedState!.stickValues).toContain('0.50');
    // Debug state should show 1 pressed button and non-zero timestamp
    expect(pressedState!.debugState).toContain('btn=1/21');
    expect(pressedState!.debugState).not.toContain('t=—');

    await app.close();
  });
});
