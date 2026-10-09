/* @layer renderer-lib @kind logic */
import { applyTriggerCalibration, useCalibrationStore } from '@drizztdourden08/brock-input/renderer';
import { SDL_AXIS } from '@rotp/game-data';
import type { ControllerInputState } from './controller-input-store.type';
import type { ControllerStateHost } from './process-controller-state.type';

const markConnected = (host: ControllerStateHost, deviceKey: string): void => {
  if (host.connectedDeviceKeys.has(deviceKey)) return;
  host.connectedDeviceKeys.add(deviceKey);
  host.connected = true;
  host.log(`Connected: ${deviceKey}`);
};

const processControllerState = (host: ControllerStateHost, deviceKey: string, buttons: boolean[], axes: number[]): void => {
  const { triggers } = useCalibrationStore.getState();
  const resolvedAxes = [...axes];
  for (let i: number = SDL_AXIS.LEFT_TRIGGER; i < resolvedAxes.length; i++) {
    const triggerCal = triggers[`${deviceKey}:${i}`];
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
