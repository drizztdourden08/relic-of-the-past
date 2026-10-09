/* @layer shared-input @kind logic */
import { hapticState } from './haptic-state';
import type { HapticSettings } from '@rotp/features';

const updateHapticSettings = (settings: HapticSettings): void => {
  hapticState.settings = { ...settings };
};

export { updateHapticSettings };
