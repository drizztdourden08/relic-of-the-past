/* @layer renderer-lib @kind logic */
/**
 * SDL3 controller state intake. The native addon already decodes and
 * factory-calibrates raw reports into normalized buttons/axes, so this
 * bypasses the legacy per-device HID report parser (process-hid-report.ts)
 * entirely.
 *
 * Trigger calibration still applies unchanged, since it already operates on the
 * normalized 0..1 domain. Stick calibration is different: it was captured
 * against raw HID values (0-255 / 0-65535), and SDL's sticks are already
 * normalized to -1..1, so applying an old calibration entry to them would
 * produce garbage. A stored entry from that old domain is detected by its
 * magnitude and skipped, logged once per device, not every frame.
 */
import { applyTriggerCalibration } from './stick-calibration';
import type { DeviceStickCalibration, TriggerCalibration } from './stick-calibration';
import type { ControllerInputState } from './controller-input-store-types';

interface ControllerStateHost {
  states: Map<string, ControllerInputState>;
  listeners: Set<(state: ControllerInputState) => void>;
  connectedDeviceKeys: Set<string>;
  connected: boolean;
  log(msg: string): void;
  getStickCalibration(deviceKey: string): DeviceStickCalibration | undefined;
  getTriggerCalibration(deviceKey: string, axisIndex: number): TriggerCalibration | undefined;
}

/** Any stored stick-calibration magnitude past this is unmistakably the old
 *  raw-HID domain (0-255 / 0-65535), never SDL's normalized -1..1 output. */
const LEGACY_DOMAIN_THRESHOLD = 1.5;

const warnedLegacyCalibration = new Set<string>();

const isLegacyStickCalibration = (cal: DeviceStickCalibration): boolean => {
  const values = [
    cal.left.centerX, cal.left.centerY, cal.left.minX, cal.left.maxX, cal.left.minY, cal.left.maxY,
    cal.right.centerX, cal.right.centerY, cal.right.minX, cal.right.maxX, cal.right.minY, cal.right.maxY,
  ];
  return values.some((v) => Math.abs(v) > LEGACY_DOMAIN_THRESHOLD);
};

const warnLegacyCalibrationOnce = (host: ControllerStateHost, deviceKey: string): void => {
  if (warnedLegacyCalibration.has(deviceKey)) return;
  warnedLegacyCalibration.add(deviceKey);
  host.log(`Skipped stick calibration for ${deviceKey}: saved values are out of range and need recalibrating`);
};

const markConnected = (host: ControllerStateHost, deviceKey: string): void => {
  if (host.connectedDeviceKeys.has(deviceKey)) return;
  host.connectedDeviceKeys.add(deviceKey);
  host.connected = true;
  host.log(`Connected: ${deviceKey}`);
};

const processControllerState = (host: ControllerStateHost, deviceKey: string, buttons: boolean[], axes: number[]): void => {
  const stickCal = host.getStickCalibration(deviceKey);
  if (stickCal && isLegacyStickCalibration(stickCal)) warnLegacyCalibrationOnce(host, deviceKey);

  const resolvedAxes = [...axes];
  for (let i = 4; i < resolvedAxes.length; i++) {
    const triggerCal = host.getTriggerCalibration(deviceKey, i);
    if (triggerCal) resolvedAxes[i] = applyTriggerCalibration(resolvedAxes[i], triggerCal);
  }

  markConnected(host, deviceKey);

  const state: ControllerInputState = {
    deviceKey,
    buttons,
    axes: resolvedAxes,
    timestamp: performance.now(),
  };
  host.states.set(deviceKey, state);
  for (const cb of host.listeners) cb(state);
};

export { isLegacyStickCalibration, processControllerState };
export type { ControllerStateHost };
