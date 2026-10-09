/* @layer shared-game @kind types */
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { MedallionId } from '../item-groups';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { PlacementSphere } from './fill.type';
import type { CapacityPoolCounts, CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopPriceView } from '../shops/shop-price.type';

interface PlacementStats {
  attempts: number;
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  shufflePrizes: boolean;
  npcDeliverableCount: number;
  worldDeliverableCount: number;
  capacityDeliverableCount: number;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  capacityCounts: CapacityPoolCounts;
  shops: ShopScope;
  ponds: PondProfiles;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  retroBow: RetroBowSetting;
  itemPower: ItemPowerSetting;
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting;
  pondPrizeCount: number;
  pondSlotsFollowMode: boolean;
  dungeonItems: DungeonItemSetting;
  accessibility: AccessibilityMode;
  locationCount: number;
  sphereCount: number;
}

interface Placement {
  seed: string;
  medallions: {
    mire: MedallionId;
    turtleRock: MedallionId;
  };
  locations: Record<LocationKey, ItemKey>;
  shopPrices: ShopPriceView;
  pondDemands: PondDemandView;
  spheres: PlacementSphere[];
  stats: PlacementStats;
}

export type { Placement, PlacementStats };
