/* @layer renderer-other @kind logic */
/**
 * The native `ControllerHid` Capacitor plugin (Android UsbManager over USB-OTG) and
 * its TS contract. Two surfaces: raw HID (enumerate/read/write/vibrate, consumed by
 * controller-host.ts) and a generic USB channel (open/claim/transfer, consumed by
 * usb-device.ts) so vendor bulk-init sequences — e.g. the Switch Pro 2 init in
 * shared/input/data/presets/switch-pro-2.ts — stay single-sourced in TS rather than
 * duplicated into Kotlin. Absent the native impl, isAvailable() is false and callers
 * degrade to no-op (web build / Bluetooth → Gamepad API).
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type { HidDeviceInfo, VibrateStep, VibrateResult } from '@shared/platform';

interface UsbEndpoint { endpointNumber: number; direction: 'in' | 'out'; type: 'bulk' | 'interrupt' | 'control' | 'isochronous' }
interface UsbInterface { index: number; endpoints: UsbEndpoint[] }
interface UsbOpenResult { handle: number; interfaces: UsbInterface[] }

interface ControllerHidPlugin {
  // Raw HID
  enumerate: () => Promise<{ devices: HidDeviceInfo[] }>;
  getOpenKeys: () => Promise<{ keys: string[] }>;
  write: (opts: { deviceKey: string; data: number[] }) => Promise<{ ok: boolean }>;
  vibrate: (opts: { deviceKey: string; pattern: VibrateStep[]; gapMs: number }) => Promise<VibrateResult>;
  // Generic USB (vendor bulk-init). usbOpen returns handle < 0 when unavailable.
  usbOpen: (opts: { vendorId: number; productId: number }) => Promise<UsbOpenResult>;
  usbClaimInterface: (opts: { handle: number; index: number }) => Promise<{ ok: boolean }>;
  usbTransferOut: (opts: { handle: number; endpoint: number; data: string }) => Promise<{ ok: boolean }>;
  usbTransferIn: (opts: { handle: number; endpoint: number; length: number }) => Promise<{ data: string }>;
  usbClose: (opts: { handle: number }) => Promise<void>;
  addListener: (event: string, cb: (data: unknown) => void) => Promise<PluginListenerHandle>;
}

const isControllerHidAvailable = (): boolean => Capacitor.isPluginAvailable('ControllerHid');

let cached: ControllerHidPlugin | null = null;
const controllerHid = (): ControllerHidPlugin => {
  cached ??= registerPlugin<ControllerHidPlugin>('ControllerHid');
  return cached;
};

// addListener resolves async; expose a synchronous unsubscribe that detaches once ready.
const bridgeEvent = (event: string, cb: (data: unknown) => void): (() => void) => {
  const handle = controllerHid().addListener(event, cb);
  return () => { handle.then((h) => h.remove()).catch(() => {}); };
};

export { isControllerHidAvailable, controllerHid, bridgeEvent };
export type { UsbEndpoint, UsbInterface, UsbOpenResult };
