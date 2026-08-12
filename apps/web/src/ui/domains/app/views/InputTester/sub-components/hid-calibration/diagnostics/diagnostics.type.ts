/* @layer renderer-components @kind types */
/**
 * Data model for the gamepad diagnostics report: who the device is, what the
 * input layer can tell us about it, and how it was identified. The per-step
 * observations the wizard gathers are not modelled here — the wizard attaches
 * its byte capture and positional capture to a report as their own artefacts,
 * each in its own native shape.
 */

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
