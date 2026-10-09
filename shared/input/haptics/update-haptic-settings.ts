/* @layer shared-input @kind logic */
import { hapticState } from './haptic-state';
import type { HapticSettings } from '../../types/settings';

const updateHapticSettings = (settings: HapticSettings): void => {
  hapticState.settings = { ...settings };
};

export { updateHapticSettings };
