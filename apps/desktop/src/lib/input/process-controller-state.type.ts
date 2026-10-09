/* @layer renderer-lib @kind types */
import type { TriggerCalibration } from './stick-calibration';
import type { ControllerInputState } from './controller-input-store.type';

interface ControllerStateHost {
  states: Map<string, ControllerInputState>;
  listeners: Set<(state: ControllerInputState) => void>;
  connectedDeviceKeys: Set<string>;
  connected: boolean;
  log(msg: string): void;
  getTriggerCalibration(deviceKey: string, axisIndex: number): TriggerCalibration | undefined;
}

export type { ControllerStateHost };
