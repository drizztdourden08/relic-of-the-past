/* @layer shared-platform @kind logic */
/**
 * ControllerHost port — the native/main-process HID surface (enumerate, raw read
 * events, write, rumble). Electron fulfills it via node-hid (window.api); web and
 * Capacitor are no-ops for now (those platforms use the Gamepad API / touch in the
 * renderer, wired in a later pass). Mirrors the current IPC signatures so the
 * Electron path is a 1:1 passthrough (Windows parity).
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
}

export type {
  ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult,
};
