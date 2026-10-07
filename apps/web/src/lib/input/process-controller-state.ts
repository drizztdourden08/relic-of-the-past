/* @layer renderer-lib @kind logic */
/**
 * SDL3 controller state intake. The native addon already decodes and
 * factory-calibrates raw reports into normalized buttons/axes, so this
 * bypasses the legacy per-device HID report parser (process-hid-report.ts)
 * entirely.
 *
 * Trigger calibration applies here, since it operates on the normalized 0..1
 * domain. SDL's sticks arrive already normalized to -1..1.
 */
import { applyTriggerCalibration } from './stick-calibration';
import type { TriggerCalibration } from './stick-calibration';
import type { ControllerInputState } from './controller-input-store-types';

interface ControllerStateHost {
  states: Map<string, ControllerInputState>;
  listeners: Set<(state: ControllerInputState) => void>;
  connectedDeviceKeys: Set<string>;
  connected: boolean;
  log(msg: string): void;
  getTriggerCalibration(deviceKey: string, axisIndex: number): TriggerCalibration | undefined;
}

const markConnected = (host: ControllerStateHost, deviceKey: string): void => {
  if (host.connectedDeviceKeys.has(deviceKey)) return;
  host.connectedDeviceKeys.add(deviceKey);
  host.connected = true;
  host.log(`Connected: ${deviceKey}`);
};

const processControllerState = (host: ControllerStateHost, deviceKey: string, buttons: boolean[], axes: number[]): void => {
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

export { processControllerState };
export type { ControllerStateHost };
