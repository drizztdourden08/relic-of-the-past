/* @layer shared-platform @kind logic */
/**
 * Platform model. Two orthogonal axes — the host shell (how the app is wrapped)
 * and the OS — plus DERIVED capability flags. Application code branches on a
 * capability (`caps.windowChrome`), never on a host/OS name, so platform checks
 * stay in one place instead of spreading across the renderer.
 */

type HostShell = 'electron' | 'capacitor' | 'web';
type OsKind = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
type FormFactor = 'desktop' | 'mobile';
type InputModel = 'pointer' | 'touch' | 'hybrid';

interface PlatformInfo {
  host: HostShell;
  os: OsKind;
  formFactor: FormFactor;
  input: InputModel;
  isDev: boolean;
}

interface Capabilities {
  windowChrome: boolean; // custom titlebar, min/max/close
  nativeHid: boolean; // node-hid raw HID + USB init
  webHid: boolean; // navigator.hid fallback (Linux/Android route)
  gamepadApi: boolean; // navigator.getGamepads
  touchControls: boolean; // needs an on-screen virtual gamepad
  customProtocol: boolean; // app-sprite:// style asset serving
  selfUpdate: boolean; // electron-updater present
  nativeFileDialog: boolean; // OS open dialog vs document picker
}

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities };
