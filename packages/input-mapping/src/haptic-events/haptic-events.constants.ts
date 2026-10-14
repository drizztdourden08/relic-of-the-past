/* @layer shared-input @kind constants */
import type { HapticPatternId } from '../data/haptics';

const HapticEventType = {
  SWORD_SWING: 0,
  SWORD_HIT_ENEMY: 1,
  SWORD_CLINK: 2,
  DAMAGE_TAKEN: 3,
  ITEM_USED: 4,
  ENVIRONMENTAL: 5,
  HOOKSHOT_WALL: 6,
  BOOMERANG_CATCH: 7,
} as const;

const EnvironmentalEvent = {
  FALL_INTO_PIT: 0,
  LAND_FROM_LEDGE: 1,
  CHEST_OPEN: 2,
  BOMB_EXPLODE: 3,
  ENTER_WATER: 4,
  MIRROR_WARP: 5,
  QUAKE: 6,
  BOSS_DEFEATED: 7,
} as const;

const HapticItemId = {
  BOMBS: 1,
  BOOMERANG: 2,
  BOW: 3,
  HAMMER: 4,
  FIRE_ROD: 5,
  ICE_ROD: 6,
  BUG_NET: 7,
  FLUTE: 8,
  LAMP: 9,
  POWDER: 10,
  BOTTLE: 11,
  BOOK: 12,
  CANE_BYRNA: 13,
  HOOKSHOT: 14,
  BOMBOS: 15,
  ETHER: 16,
  QUAKE: 17,
  CANE_SOMARIA: 18,
  CAPE: 19,
  MIRROR: 20,
  SHOVEL: 21,
} as const;

const ITEM_PATTERN_IDS: Partial<Record<number, HapticPatternId>> = {
  [HapticItemId.BOMBS]: 'itemBomb',
  [HapticItemId.BOW]: 'itemBow',
  [HapticItemId.HAMMER]: 'itemHammer',
  [HapticItemId.FIRE_ROD]: 'itemFireRod',
  [HapticItemId.ICE_ROD]: 'itemIceRod',
  [HapticItemId.HOOKSHOT]: 'itemHookshot',
  [HapticItemId.BOMBOS]: 'itemBombos',
  [HapticItemId.ETHER]: 'itemEther',
  [HapticItemId.QUAKE]: 'itemQuake',
  [HapticItemId.CANE_SOMARIA]: 'itemCaneSomaria',
  [HapticItemId.CANE_BYRNA]: 'itemCaneSomaria',
  [HapticItemId.CAPE]: 'itemCape',
  [HapticItemId.SHOVEL]: 'itemShovel',
};

const DAMAGE_HIGH_THRESHOLD = 40;
const DAMAGE_MEDIUM_THRESHOLD = 24;

export { DAMAGE_HIGH_THRESHOLD, DAMAGE_MEDIUM_THRESHOLD, EnvironmentalEvent, HapticEventType, HapticItemId, ITEM_PATTERN_IDS };
