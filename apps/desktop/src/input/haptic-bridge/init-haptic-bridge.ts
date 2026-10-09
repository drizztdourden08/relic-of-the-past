/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import { handleHapticEvent, setVibrateFunction, updateHapticSettings, loadRumbleStrengthCache, readRumbleStrength, hapticState, startDebugLog } from '@rotp/input-mapping';
import type { HapticSettings } from '@rotp/features';
import { getPlatform } from '@drizztdourden08/brock-react';
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
