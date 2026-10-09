/* @layer renderer-lib @kind logic */
import { hapticState } from './haptic-state';

const updateHapticsProfileEnabled = (enabled: boolean): void => {
  hapticState.profileEnabled = enabled;
};

export { updateHapticsProfileEnabled };
