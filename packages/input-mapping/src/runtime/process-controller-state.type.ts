/* @layer renderer-lib @kind types */
import type { ControllerInputState } from './controller-input-store.type';

interface ControllerStateHost {
  states: Map<string, ControllerInputState>;
  listeners: Set<(state: ControllerInputState) => void>;
  connectedDeviceKeys: Set<string>;
  connected: boolean;
  log(msg: string): void;
}

export type { ControllerStateHost };
