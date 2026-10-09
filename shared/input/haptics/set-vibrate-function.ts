/* @layer shared-input @kind logic */
import { hapticState } from './haptic-state';
import type { VibrateFunction } from './haptics.type';

const setVibrateFunction = (fn: VibrateFunction | null): void => {
  hapticState.vibrateFn = fn;
};

export { setVibrateFunction };
