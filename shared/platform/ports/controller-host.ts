/* @layer shared-platform @kind logic */
/**
 * The native/main-process HID surface (enumerate, raw read events, write, rumble). Electron and
 * Capacitor each front an SDL3 gamepad backend (Node-API addon, JNI plugin) and implement the
 * already-decoded parts: onControllerState and vibratePattern. Electron's device list is a
 * separate IPC surface (sdl3-source.ts / controller-devices-store.ts), so its `enumerate` is a
 * no-op; Capacitor's answers from the SDL3-claimed set. The raw-report members (write, onReport,
 * onDeviceOpened, getOpenKeys, onMainPerf) are no-ops on both: nothing reads raw HID reports
 * today. Plain web is a no-op throughout (Gamepad API / touch).
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
  // SDL3 native transport gives already-decoded state, with no raw report parsing.
  // See apps/desktop/electron/input/sdl3-source.ts.
  onControllerState: (cb: (deviceKey: string, buttons: boolean[], axes: number[]) => void) => Unsubscribe;
}

export type {
  ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult,
};
