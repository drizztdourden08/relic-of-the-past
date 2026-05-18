/**
 * HID Priority — verifies that HID-enumerated controllers get inputApi='hid',
 * not 'webapi'. The Gamepad API should only be used for Xbox/XInput controllers.
 */

import { test, expect } from '@playwright/test';
import { launchApp, clearAppData, seedSingleProfile, TEST_ROMS } from './helpers';

test.describe('HID Priority', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('HID-enumerated device gets inputApi=hid, not webapi', async () => {
    // Seed a profile so the app loads (InputManager starts automatically)
    {
      const { app, window } = await launchApp();
      await seedSingleProfile(window, TEST_ROMS.usa, 'Test');
      await app.close();
    }

    const { app, window } = await launchApp();

    // Wait for InputManager to be initialized (App.tsx calls getInputManager())
    const devices = await window.evaluate(async () => {
      for (let i = 0; i < 30; i++) {
        if ((window as any).__inputManager) break;
        await new Promise(r => setTimeout(r, 500));
      }
      const mgr = (window as any).__inputManager;
      if (!mgr) return null;

      // Trigger fresh HID enumeration and wait for async refresh
      const hidDevices = await (window as any).api.enumerateHidDevices();
      mgr.hidDeviceCache = hidDevices;
      mgr.refreshDevices();
      await new Promise(r => setTimeout(r, 2000));

      return mgr.getDevices().map((d: any) => ({
        id: d.id,
        displayName: d.displayName,
        vendorId: d.vendorId,
        productId: d.productId,
        inputApi: d.inputApi,
        activated: d.activated,
        type: d.type,
        deviceFamily: d.deviceFamily,
      }));
    });

    console.log('Detected devices:', JSON.stringify(devices, null, 2));
    expect(devices, 'InputManager should be accessible').not.toBeNull();

    const gamepadDevices = devices!.filter((d: any) => d.type === 'gamepad');
    expect(gamepadDevices.length, 'Should have at least one gamepad').toBeGreaterThan(0);

    for (const dev of gamepadDevices) {
      console.log(`${dev.displayName} (${dev.vendorId}:${dev.productId}) → inputApi=${dev.inputApi}`);
      if (dev.vendorId === '045e') {
        expect(dev.inputApi, `Xbox device should be xinput`).toBe('xinput');
      } else {
        expect(dev.inputApi, `${dev.displayName} (${dev.vendorId}:${dev.productId}) should be hid`).toBe('hid');
      }
    }

    // Specifically check the GameCube adapter
    const gc = gamepadDevices.find((d: any) => d.vendorId === '057e' && d.productId === '2073');
    if (gc) {
      expect(gc.inputApi).toBe('hid');
      expect(gc.activated).toBe(true);
      expect(gc.displayName).toBe('Nintendo GameCube Wireless Controller');
      console.log(`PASS: GameCube adapter inputApi=${gc.inputApi}, activated=${gc.activated}, name=${gc.displayName}`);
    }

    // Verify webHidReader tracks the device as connected (even without button press)
    const readerState = await window.evaluate(() => {
      const reader = (window as any).__webHidReader;
      if (!reader) return null;
      return {
        isConnected: reader.isConnected(),
        connectedKeys: reader.getConnectedDeviceKeys(),
        diagLog: reader.getDiagLog(),
      };
    });

    console.log('webHidReader state:', JSON.stringify(readerState, null, 2));
    if (readerState) {
      expect(readerState.isConnected, 'webHidReader should be connected').toBe(true);
      expect(readerState.connectedKeys).toContain('057e:2073');
      // Diagnostics should include a "Device opened" or "IPC device connected" entry
      const hasConnectLog = readerState.diagLog.some((l: string) =>
        l.includes('057e:2073') && (l.includes('opened') || l.includes('connected'))
      );
      expect(hasConnectLog, 'Diagnostics should log device connection').toBe(true);
    }

    await app.close();
  });
});
