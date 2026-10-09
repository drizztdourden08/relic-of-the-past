/* @layer shared-input @kind logic */
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';
import type { PickupPatternId } from './haptics.type';

const handlePickup = (type: PickupPatternId): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !settings.environmentalEffects || !hapticState.vibrateFn) return;
  firePattern(type);
};

export { handlePickup };
