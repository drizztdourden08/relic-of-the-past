/* @layer shared-input @kind logic */
import { HapticEventType, getDamagePatternId, getEnvironmentalPatternId, getItemPatternId } from '../haptic-events';
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';

const handleHapticEvent = (eventType: number, param: number): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !hapticState.vibrateFn) return;

  switch (eventType) {
    case HapticEventType.SWORD_SWING:
      if (settings.swordSwing) firePattern(param === 1 ? 'swordSwingRapid' : 'swordSwing');
      break;

    case HapticEventType.SWORD_HIT_ENEMY:
      if (settings.swordHitEnemy) firePattern('swordHitEnemy');
      break;

    case HapticEventType.SWORD_CLINK:
      if (settings.swordClink) firePattern('swordClink');
      break;

    case HapticEventType.DAMAGE_TAKEN:
      if (settings.damageTaken) firePattern(getDamagePatternId(param));
      break;

    case HapticEventType.ITEM_USED: {
      if (!settings.itemUse) break;
      const id = getItemPatternId(param);
      if (id) firePattern(id);
      break;
    }

    case HapticEventType.ENVIRONMENTAL: {
      if (!settings.environmentalEffects) break;
      const id = getEnvironmentalPatternId(param);
      if (id) firePattern(id);
      break;
    }

    case HapticEventType.HOOKSHOT_WALL:
      if (settings.itemUse) firePattern('itemHookshotWall');
      break;

    case HapticEventType.BOOMERANG_CATCH:
      if (settings.itemUse) firePattern('itemBoomerangCatch');
      break;
  }
};

export { handleHapticEvent };
