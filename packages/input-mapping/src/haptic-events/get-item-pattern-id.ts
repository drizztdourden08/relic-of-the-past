/* @layer shared-input @kind logic */
import { HapticItemId } from './haptic-events.constants';
import type { HapticPatternId } from '../data/haptics';

const getItemPatternId = (itemId: number): HapticPatternId | null => {
  switch (itemId) {
    case HapticItemId.BOMBS: return 'itemBomb';
    case HapticItemId.BOOMERANG: return null;
    case HapticItemId.BOW: return 'itemBow';
    case HapticItemId.HAMMER: return 'itemHammer';
    case HapticItemId.FIRE_ROD: return 'itemFireRod';
    case HapticItemId.ICE_ROD: return 'itemIceRod';
    case HapticItemId.HOOKSHOT: return 'itemHookshot';
    case HapticItemId.BOMBOS: return 'itemBombos';
    case HapticItemId.ETHER: return 'itemEther';
    case HapticItemId.QUAKE: return 'itemQuake';
    case HapticItemId.CANE_SOMARIA: return 'itemCaneSomaria';
    case HapticItemId.CANE_BYRNA: return 'itemCaneSomaria';
    case HapticItemId.CAPE: return 'itemCape';
    case HapticItemId.MIRROR: return null;
    case HapticItemId.SHOVEL: return 'itemShovel';
    default: return null;
  }
};

export { getItemPatternId };
