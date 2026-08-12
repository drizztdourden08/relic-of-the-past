/* @layer renderer-components @kind logic */
/**
 * Assembles the final GamepadDiagnosticsReport from the pieces the wizard
 * gathered along the way: device identity and native-capture status. The
 * captures themselves travel with the report as separate artefacts, each in
 * its own shape, rather than being flattened into this summary.
 */
import type { DeviceEntry } from '@shared/ipc';
import type { DevicePreset } from '@shared/types/controls';
import type { NativeCaptureStatus } from './hooks/useNativeCaptures';
import type { GamepadDiagnosticsReport } from './diagnostics.type';

interface BuildReportArgs {
  deviceKey: string;
  name: string;
  deviceEntry: DeviceEntry | null;
  preset: DevicePreset | null;
  nativeStatus: NativeCaptureStatus;
  platform: string;
  appVersion: string;
}

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const buildReport = (args: BuildReportArgs): GamepadDiagnosticsReport => {
  const { deviceKey, name, deviceEntry, preset, nativeStatus, platform, appVersion } = args;
  return {
    deviceKey,
    name,
    vendorId: deviceEntry ? toHex4(deviceEntry.vendorId) : deviceKey.split(':')[0] ?? '0000',
    productId: deviceEntry ? toHex4(deviceEntry.productId) : deviceKey.split(':')[1] ?? '0000',
    guid: deviceEntry?.guid ?? null,
    busType: deviceEntry?.busType ?? 'unknown',
    hasRumble: deviceEntry?.hasRumble ?? false,
    hasGyro: deviceEntry?.hasGyro ?? false,
    sdlMapping: nativeStatus.mappingString,
    resolvedPreset: preset ? { id: preset.id, name: preset.name, matchedBy: 'vid-pid' } : null,
    joystick: nativeStatus.joystickCounts
      ? {
        numButtons: nativeStatus.joystickCounts.numButtons,
        numAxes: nativeStatus.joystickCounts.numAxes,
        numHats: nativeStatus.joystickCounts.numHats,
        hasGamepadMapping: nativeStatus.joystickCounts.hasGamepadMapping,
      }
      : null,
    rawBytesAvailable: nativeStatus.rawAvailable,
    rawUnavailableReason: nativeStatus.rawUnavailableReason,
    platform,
    appVersion,
    createdAt: Date.now(),
  };
};

export { buildReport };
