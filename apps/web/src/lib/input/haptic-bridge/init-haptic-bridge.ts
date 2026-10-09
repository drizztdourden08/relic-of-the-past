/* @layer renderer-lib @kind logic */
import { handleHapticEvent, setVibrateFunction, updateHapticSettings } from '@shared/input/haptics';
import type { HapticSettings } from '@shared/input/haptics';
import { loadRumbleStrengthCache } from '@shared/input/haptics-rumble-strength';
import { readRumbleStrength } from '@shared/storage/rumble-strength';
import { getPlatform } from '@app/platform/get-platform';
import { hapticState } from './haptic-state';
import { startDebugLog } from './start-debug-log';
import { dispatchVibration } from './dispatch-vibration';

const onHapticEvent = (eventType: number, param: number): void => {
  hapticState.counts.coreHooks++;
  handleHapticEvent(eventType, param);
};

const initHapticBridge = (settings: HapticSettings): void => {
  if (hapticState.initialized) return;
  hapticState.initialized = true;

  if (window.api?.isDev) startDebugLog();
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);
  readRumbleStrength(getPlatform().files).then(loadRumbleStrengthCache).catch(() => undefined);

  Object.assign(window, { __onHapticEvent: onHapticEvent });
};

export { initHapticBridge };
