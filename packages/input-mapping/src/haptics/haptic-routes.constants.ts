/* @layer shared-input @kind constants */
import { HapticEventType, getDamagePatternId, getEnvironmentalPatternId, getItemPatternId } from '../haptic-events';
import type { HapticRoute } from './haptics.type';

const HAPTIC_ROUTES: Partial<Record<number, HapticRoute>> = {
  [HapticEventType.SWORD_SWING]: {
    setting: 'swordSwing',
    pattern: (param) => (param === 1 ? 'swordSwingRapid' : 'swordSwing'),
  },
  [HapticEventType.SWORD_HIT_ENEMY]: { setting: 'swordHitEnemy', pattern: () => 'swordHitEnemy' },
  [HapticEventType.SWORD_CLINK]: { setting: 'swordClink', pattern: () => 'swordClink' },
  [HapticEventType.DAMAGE_TAKEN]: { setting: 'damageTaken', pattern: getDamagePatternId },
  [HapticEventType.ITEM_USED]: { setting: 'itemUse', pattern: getItemPatternId },
  [HapticEventType.ENVIRONMENTAL]: { setting: 'environmentalEffects', pattern: getEnvironmentalPatternId },
  [HapticEventType.HOOKSHOT_WALL]: { setting: 'itemUse', pattern: () => 'itemHookshotWall' },
  [HapticEventType.BOOMERANG_CATCH]: { setting: 'itemUse', pattern: () => 'itemBoomerangCatch' },
};

export { HAPTIC_ROUTES };
