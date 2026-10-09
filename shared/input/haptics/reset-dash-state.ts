/* @layer shared-input @kind logic */
import { hapticState } from './haptic-state';

const resetDashState = (): void => {
  hapticState.lastDashPulseTime = 0;
};

export { resetDashState };
