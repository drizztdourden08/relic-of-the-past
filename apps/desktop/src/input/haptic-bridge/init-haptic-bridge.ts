/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import { handleHapticEvent, setVibrateFunction, updateHapticSettings } from '@rotp/input-mapping';
import type { HapticSettings } from '@rotp/features';
import { loadRumbleStrengthCache } from '@rotp/input-mapping';
import { readRumbleStrength } from '@rotp/input-mapping';
import { getPlatform } from '@drizztdourden08/brock-react';
import { hapticState } from '@rotp/input-mapping';
import { startDebugLog } from '@rotp/input-mapping';
import { dispatchVibration } from './dispatch-vibration';

const onHapticEvent = (eventType: number, param: number): void => {
  hapticState.counts.coreHooks++;
  handleHapticEvent(eventType, param);
};

const initHapticBridge = (settings: HapticSettings): void => {
  if (hapticState.initialized) return;
  hapticState.initialized = true;

  if (appApi()?.isDev) startDebugLog();
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);
  readRumbleStrength(getPlatform().files).then(loadRumbleStrengthCache).catch(() => undefined);

  Object.assign(window, { __onHapticEvent: onHapticEvent });
};

export { initHapticBridge };
