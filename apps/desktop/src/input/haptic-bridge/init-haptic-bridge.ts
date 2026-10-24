/* @layer renderer-lib @kind logic */
import { handleHapticEvent, setVibrateFunction, updateHapticSettings, hapticState, startDebugLog } from '@rotp/input-mapping';
import type { HapticSettings } from '@rotp/features';
import { hostApi } from '@drizztdourden08/brock-react';
import { dispatchVibration } from './dispatch-vibration';

const onHapticEvent = (eventType: number, param: number): void => {
  hapticState.counts.coreHooks++;
  handleHapticEvent(eventType, param);
};

const initHapticBridge = (settings: HapticSettings): void => {
  if (hapticState.initialized) return;
  hapticState.initialized = true;

  if (hostApi()?.isDev) startDebugLog();
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);

  Object.assign(window, { __onHapticEvent: onHapticEvent });
};

export { initHapticBridge };
