/* @layer shared-game @kind logic */
/**
 * The stats of the Normal placement: nothing shuffled, every setting at the reading the
 * reference world pins, so a rebuild from these stats is the unmodified game.
 */
import { REFERENCE_CAPACITY_PROFILE } from './world/capacity/capacity-profile-defaults';
import { REFERENCE_CAPACITY_BONUS } from './world/capacity/bonus/capacity-bonus.data';
import { capacityPoolCountsOf } from './world/capacity/family-plan';
import { LEGACY_POND_PROFILES } from './world/pond/pond-profile-defaults';
import { NO_SHOP_SCOPE } from './world/shops/shop-scope-from-values';
import { DEFAULT_PROGRESSIVE_SETTING } from './world/progressive/progressive-families.data';
import { DEFAULT_PROGRESSIVE_MODES } from './world/progressive/progressive-modes.data';
import { DEFAULT_RETRO_BOW } from './world/retro/retro-bow.data';
import { DEFAULT_ITEM_POWER } from './world/item-power/item-power.data';
import { DEFAULT_STORY_GATES } from './world/story-gates/story-gates.data';
import { DEFAULT_DUNGEON_ITEM_SETTING } from './world/dungeon-items/dungeon-item-modes';
import { DEFAULT_ACCESSIBILITY } from './world/accessibility/accessibility-from-snapshot';
import type { DarkRoomSetting } from './world/dark-rooms/dark-room.type';
import type { PlacementStats } from './world/fill/placement.type';
import type { StoryGateSetting } from './world/story-gates/story-gate.type';

interface NormalStatsParams {
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting | undefined;
  locationCount: number;
  sphereCount: number;
}

const normalPlacementStats = (params: NormalStatsParams): PlacementStats => {
  const { darkRooms, storyGates, locationCount, sphereCount } = params;
  return {
    attempts: 1,
    keyDropShuffle: true,
    includeNpcChecks: true,
    includeWorldItems: true,
    shufflePrizes: false,
    npcDeliverableCount: 0,
    worldDeliverableCount: 0,
    capacityDeliverableCount: 0,
    capacity: REFERENCE_CAPACITY_PROFILE,
    capacityProgressive: false,
    capacityBonus: REFERENCE_CAPACITY_BONUS,
    capacityCounts: capacityPoolCountsOf(REFERENCE_CAPACITY_PROFILE, 0),
    shops: NO_SHOP_SCOPE,
    ponds: LEGACY_POND_PROFILES,
    progressiveTiers: DEFAULT_PROGRESSIVE_SETTING,
    progressiveModes: DEFAULT_PROGRESSIVE_MODES,
    retroBow: DEFAULT_RETRO_BOW,
    itemPower: DEFAULT_ITEM_POWER,
    darkRooms,
    storyGates: storyGates ?? DEFAULT_STORY_GATES,
    pondPrizeCount: 0,
    pondSlotsFollowMode: false,
    dungeonItems: DEFAULT_DUNGEON_ITEM_SETTING,
    accessibility: DEFAULT_ACCESSIBILITY,
    locationCount,
    sphereCount,
  };
};

export { normalPlacementStats };
