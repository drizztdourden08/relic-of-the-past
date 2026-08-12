/* @layer shared-platform @kind logic */
/**
 * ControllerHost port — the native/main-process HID surface (enumerate, raw read
 * events, write, rumble). Electron and Capacitor each front an SDL3 gamepad
 * backend (a Node-API addon on desktop, a JNI plugin on Android) and both
 * implement the parts that backend reports as already-decoded state:
 * onControllerState and vibratePattern. Electron's device list is a
 * separate IPC surface (see sdl3-source.ts / controller-devices-store.ts),
 * so its `enumerate` here stays an empty no-op; Capacitor has no such
 * separate channel, so its `enumerate` answers from the same SDL3-claimed
 * device set instead. The raw-report members (write, onReport,
 * onDeviceOpened, getOpenKeys, onMainPerf) stay honest no-ops on both
 * platforms: no wired implementation reads a raw HID report on either one
 * today. Plain web is a no-op throughout (that platform uses the Gamepad
 * API / touch instead).
 */
type Unsubscribe = () => void;

interface HidDeviceInfo {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
  path: string;
  serialNumber: string | null;
}
interface HidOpenedInfo { deviceKey: string; vendorId: string; productId: string; product: string }
interface HidDisconnectInfo { deviceKey: string; product: string; error?: string }
interface HidErrorInfo { deviceKey: string; error: string }
interface VibrateStep { durationMs: number; intensity: number }
interface VibrateResult { ok: boolean; error?: string }

interface ControllerHost {
  enumerate: () => Promise<HidDeviceInfo[]>;
  getOpenKeys: () => Promise<string[]>;
  write: (deviceKey: string, data: number[]) => Promise<boolean>;
  vibratePattern: (deviceKey: string, pattern: VibrateStep[], gapMs: number) => Promise<VibrateResult>;
  onReport: (cb: (deviceKey: string, vendorId: number, productId: number, data: Buffer) => void) => Unsubscribe;
  onDeviceOpened: (cb: (info: HidOpenedInfo) => void) => Unsubscribe;
  onDisconnect: (cb: (info: HidDisconnectInfo) => void) => Unsubscribe;
  onError: (cb: (info: HidErrorInfo) => void) => Unsubscribe;
  onMainPerf: (cb: (msg: string) => void) => Unsubscribe;
  // SDL3 native transport — already-decoded state, no raw report parsing.
  // See apps/desktop/electron/input/sdl3-source.ts.
  onControllerState: (cb: (deviceKey: string, buttons: boolean[], axes: number[]) => void) => Unsubscribe;
}

export type {
  ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult,
};
