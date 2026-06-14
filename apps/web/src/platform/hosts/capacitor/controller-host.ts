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
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type { ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult } from '@shared/platform';

interface NativeReport { deviceKey: string; vendorId: number; productId: number; data: string }

interface ControllerHidPlugin {
  enumerate: () => Promise<{ devices: HidDeviceInfo[] }>;
  getOpenKeys: () => Promise<{ keys: string[] }>;
  write: (opts: { deviceKey: string; data: number[] }) => Promise<{ ok: boolean }>;
  vibrate: (opts: { deviceKey: string; pattern: VibrateStep[]; gapMs: number }) => Promise<VibrateResult>;
  addListener: (event: string, cb: (data: unknown) => void) => Promise<PluginListenerHandle>;
}

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

// addListener resolves async; expose a synchronous unsubscribe that detaches once ready.
const bridge = (plugin: ControllerHidPlugin, event: string, cb: (data: unknown) => void): (() => void) => {
  const handle = plugin.addListener(event, cb);
  return () => { handle.then((h) => h.remove()).catch(() => {}); };
};

const createCapacitorControllerHost = (): ControllerHost => {
  if (!Capacitor.isPluginAvailable('ControllerHid')) return noop;
  const plugin = registerPlugin<ControllerHidPlugin>('ControllerHid');

  return {
    enumerate: async () => (await plugin.enumerate()).devices,
    getOpenKeys: async () => (await plugin.getOpenKeys()).keys,
    write: async (deviceKey, data) => (await plugin.write({ deviceKey, data })).ok,
    vibratePattern: (deviceKey, pattern, gapMs) => plugin.vibrate({ deviceKey, pattern, gapMs }),
    onReport: (cb) => bridge(plugin, 'report', (d) => {
      const r = d as NativeReport;
      cb(r.deviceKey, r.vendorId, r.productId, Buffer.from(r.data, 'base64'));
    }),
    onDeviceOpened: (cb) => bridge(plugin, 'deviceOpened', (d) => cb(d as HidOpenedInfo)),
    onDisconnect: (cb) => bridge(plugin, 'disconnect', (d) => cb(d as HidDisconnectInfo)),
    onError: (cb) => bridge(plugin, 'error', (d) => cb(d as HidErrorInfo)),
    onMainPerf: () => () => {},
  };
};

export { createCapacitorControllerHost };
