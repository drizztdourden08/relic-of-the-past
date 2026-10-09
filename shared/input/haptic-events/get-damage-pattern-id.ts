/* @layer shared-input @kind logic */
import { DAMAGE_HIGH_THRESHOLD, DAMAGE_MEDIUM_THRESHOLD } from './haptic-events.constants';
import type { HapticPatternId } from '../data/haptics';

const getDamagePatternId = (damageAmount: number): HapticPatternId => {
  if (damageAmount >= DAMAGE_HIGH_THRESHOLD) return 'damageHigh';
  if (damageAmount >= DAMAGE_MEDIUM_THRESHOLD) return 'damageMedium';
  return 'damageLow';
};

export { getDamagePatternId };
