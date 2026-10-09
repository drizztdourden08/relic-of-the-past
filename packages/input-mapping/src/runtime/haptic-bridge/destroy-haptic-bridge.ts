/* @layer renderer-lib @kind logic */
import { setVibrateFunction } from '../../haptics';
import { hapticState } from './haptic-state';

const destroyHapticBridge = (): void => {
  Object.assign(window, { __onHapticEvent: null });
  setVibrateFunction(null);
  if (hapticState.decayTimer !== null) clearTimeout(hapticState.decayTimer);
  if (hapticState.debugLogTimer !== null) clearInterval(hapticState.debugLogTimer);
  hapticState.debugLogTimer = null;
  hapticState.activeIntensity = 0;
  hapticState.activeUntil = 0;
  hapticState.initialized = false;
};

export { destroyHapticBridge };
