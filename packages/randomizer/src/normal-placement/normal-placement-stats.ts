/* @layer shared-game @kind logic */
import { REFERENCE_CAPACITY_PROFILE } from '../world/capacity/capacity-profile-defaults';
import { REFERENCE_CAPACITY_BONUS } from '../world/capacity/bonus/capacity-bonus.constants';
import { capacityPoolCountsOf } from '../world/capacity/family-plan';
import { LEGACY_POND_PROFILES } from '../world/pond/pond-profile-defaults';
import { NO_SHOP_SCOPE } from '../world/shops/shop-scope-from-values';
import { DEFAULT_PROGRESSIVE_SETTING } from '../world/progressive/progressive-families.constants';
import { DEFAULT_PROGRESSIVE_MODES } from '../world/progressive/progressive-modes';
import { DEFAULT_RETRO_BOW } from '../world/retro/retro-bow.constants';
import { DEFAULT_ITEM_POWER } from '../world/item-power/item-power.constants';
import { DEFAULT_STORY_GATES } from '../world/story-gates/story-gates.constants';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../world/dungeon-items/dungeon-item-modes';
import { DEFAULT_ACCESSIBILITY } from '../world/accessibility/accessibility-from-snapshot';
import type { PlacementStats } from '../world/fill/placement.type';
import type { NormalStatsParams } from './normal-placement.type';

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
