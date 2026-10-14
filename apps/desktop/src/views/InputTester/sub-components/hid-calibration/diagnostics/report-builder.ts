/* @layer renderer-components @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { GamepadDiagnosticsReport } from './diagnostics.type';
import type { NativeCaptureStatus } from './native-captures.type';
import type { BuildReportArgs } from './report-builder.type';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const vidPidOf = (deviceKey: string, deviceEntry: DeviceEntry | null): { vendorId: string; productId: string } => {
  if (deviceEntry) return { vendorId: toHex4(deviceEntry.vendorId), productId: toHex4(deviceEntry.productId) };
  const [vendorId = '0000', productId = '0000'] = deviceKey.split(':');
  return { vendorId, productId };
};

const deviceFlagsOf = (deviceEntry: DeviceEntry | null) => ({
  guid: deviceEntry?.guid ?? null,
  busType: deviceEntry?.busType ?? 'unknown',
  hasRumble: deviceEntry?.hasRumble ?? false,
  hasGyro: deviceEntry?.hasGyro ?? false,
});

const joystickOf = (counts: NativeCaptureStatus['joystickCounts']): GamepadDiagnosticsReport['joystick'] => {
  if (!counts) return null;
  return {
    numButtons: counts.numButtons,
    numAxes: counts.numAxes,
    numHats: counts.numHats,
    hasGamepadMapping: counts.hasGamepadMapping,
  };
};

const buildReport = (args: BuildReportArgs): GamepadDiagnosticsReport => {
  const { deviceKey, name, deviceEntry, preset, nativeStatus, platform, appVersion } = args;
  return {
    deviceKey,
    name,
    ...vidPidOf(deviceKey, deviceEntry),
    ...deviceFlagsOf(deviceEntry),
    sdlMapping: nativeStatus.mappingString,
    resolvedPreset: preset ? { id: preset.id, name: preset.name, matchedBy: 'vid-pid' } : null,
    joystick: joystickOf(nativeStatus.joystickCounts),
    rawBytesAvailable: nativeStatus.rawAvailable,
    rawUnavailableReason: nativeStatus.rawUnavailableReason,
    platform,
    appVersion,
    createdAt: Date.now(),
  };
};

export { buildReport };
