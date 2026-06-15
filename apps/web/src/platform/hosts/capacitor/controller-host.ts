/* @layer renderer-other @kind logic */
/**
 * Capacitor ControllerHost — bridges the native `ControllerHid` plugin (Android
 * UsbManager over USB-OTG) into the same ControllerHost contract Electron fulfils,
 * so the renderer's raw-HID path (parser, presets, haptics, Switch/NSO init) works
 * unchanged. Raw HID on Android is wired-only: Bluetooth pads come through the
 * Gamepad API instead. When the native plugin isn't present (web build, or an APK
 * built without it) this degrades to a no-op host — Tier 1 (Gamepad API) is
 * unaffected. See docs/controllers/support-matrix.md.
 */
import type { ControllerHost, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo } from '@shared/platform';
import { isControllerHidAvailable, controllerHid, bridgeEvent } from './controller-hid-plugin';

interface NativeReport { deviceKey: string; vendorId: number; productId: number; data: string }

const noop: ControllerHost = {
  enumerate: async () => [],
  getOpenKeys: async () => [],
  write: async () => false,
  vibratePattern: async () => ({ ok: false }),
  onReport: () => () => {},
  onDeviceOpened: () => () => {},
  onDisconnect: () => () => {},
  onError: () => () => {},
  onMainPerf: () => () => {},
};

const createCapacitorControllerHost = (): ControllerHost => {
  if (!isControllerHidAvailable()) return noop;
  const plugin = controllerHid();

  return {
    enumerate: async () => (await plugin.enumerate()).devices,
    getOpenKeys: async () => (await plugin.getOpenKeys()).keys,
    write: async (deviceKey, data) => (await plugin.write({ deviceKey, data })).ok,
    vibratePattern: (deviceKey, pattern, gapMs) => plugin.vibrate({ deviceKey, pattern, gapMs }),
    onReport: (cb) => bridgeEvent('report', (d) => {
      const r = d as NativeReport;
      cb(r.deviceKey, r.vendorId, r.productId, Buffer.from(r.data, 'base64'));
    }),
    onDeviceOpened: (cb) => bridgeEvent('deviceOpened', (d) => cb(d as HidOpenedInfo)),
    onDisconnect: (cb) => bridgeEvent('disconnect', (d) => cb(d as HidDisconnectInfo)),
    onError: (cb) => bridgeEvent('error', (d) => cb(d as HidErrorInfo)),
    onMainPerf: () => () => {},
  };
};

export { createCapacitorControllerHost };
