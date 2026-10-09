/* @layer renderer-components @kind types */
interface ResolvedPreset {
  id: string;
  name: string;
  matchedBy: 'vid-pid' | 'none';
}

interface JoystickCounts {
  numButtons: number;
  numAxes: number;
  numHats: number;
  hasGamepadMapping: boolean;
}

interface GamepadDiagnosticsReport {
  deviceKey: string;
  name: string;
  vendorId: string;
  productId: string;
  guid: string | null;
  busType: string;
  hasRumble: boolean;
  hasGyro: boolean;
  sdlMapping: string | null;
  resolvedPreset: ResolvedPreset | null;
  joystick: JoystickCounts | null;
  rawBytesAvailable: boolean;
  rawUnavailableReason: string | null;
  platform: string;
  appVersion: string;
  createdAt: number;
}

export type {
  GamepadDiagnosticsReport,
  JoystickCounts,
  ResolvedPreset,
};
