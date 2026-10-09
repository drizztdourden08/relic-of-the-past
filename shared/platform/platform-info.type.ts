/* @layer shared-platform @kind types */
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
  windowChrome: boolean;
  nativeHid: boolean;
  touchControls: boolean;
  customProtocol: boolean;
  selfUpdate: boolean;
  nativeFileDialog: boolean;
  revealDataFolder: boolean;
  hapticFeedback: boolean;
}

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities };
