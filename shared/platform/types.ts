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
  nativeHid: boolean; // raw HID enumerate/read/write (Capacitor's Android USB-OTG plugin only — desktop reads controllers through SDL3's already-decoded state instead)
  touchControls: boolean; // needs an on-screen virtual gamepad
  customProtocol: boolean; // app-sprite:// style asset serving
  selfUpdate: boolean; // the host can install updates itself
  nativeFileDialog: boolean; // OS open dialog vs document picker
  revealDataFolder: boolean; // can open the data dir in an OS file manager
  hapticFeedback: boolean; // controller rumble / device vibration available
}

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities };
