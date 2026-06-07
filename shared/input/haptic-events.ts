/* @layer shared-input @kind logic */
/** Haptic event/item enums (must match C-side) + game-value → pattern selectors. */
import type { HapticPatternId } from './data/haptics';

// ─── Event Types (must match C-side enum in haptic_events.c) ───

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

type HapticEventTypeValue = (typeof HapticEventType)[keyof typeof HapticEventType];

// Environmental sub-events (param value when event_type = ENVIRONMENTAL)
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

// Item IDs (from the game's item switch in player.c)
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

// ─── Pattern Selection Logic ───

const getDamagePatternId = (damageAmount: number): HapticPatternId => {
  if (damageAmount >= 40) return 'damageHigh';
  if (damageAmount >= 24) return 'damageMedium';
  return 'damageLow';
};

const getItemPatternId = (itemId: number): HapticPatternId | null => {
  switch (itemId) {
    case HapticItemId.BOMBS: return 'itemBomb';
    case HapticItemId.BOOMERANG: return null; // catch handled by separate event
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
    case HapticItemId.MIRROR: return null; // handled by environmental
    case HapticItemId.SHOVEL: return 'itemShovel';
    default: return null;
  }
};

const getEnvironmentalPatternId = (subEvent: number): HapticPatternId | null => {
  switch (subEvent) {
    case EnvironmentalEvent.FALL_INTO_PIT: return 'fallIntoPit';
    case EnvironmentalEvent.LAND_FROM_LEDGE: return 'landFromLedge';
    case EnvironmentalEvent.CHEST_OPEN: return 'chestOpen';
    case EnvironmentalEvent.BOMB_EXPLODE: return 'bombExplode';
    case EnvironmentalEvent.ENTER_WATER: return 'enterWater';
    case EnvironmentalEvent.MIRROR_WARP: return 'mirrorWarp';
    case EnvironmentalEvent.QUAKE: return 'quakeEnvironment';
    case EnvironmentalEvent.BOSS_DEFEATED: return 'bossDefeated';
    default: return null;
  }
};

export { HapticEventType, EnvironmentalEvent, HapticItemId, getDamagePatternId, getItemPatternId, getEnvironmentalPatternId };
export type { HapticEventTypeValue };
