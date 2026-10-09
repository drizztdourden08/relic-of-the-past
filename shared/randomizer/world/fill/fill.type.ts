/* @layer shared-game @kind types */
import type { CheckId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { CollectionState } from '../collection-state';
import type { Rng } from '../../rng';
import type { OptionValues } from '../options.type';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { FillWorld, FillWorldOptions } from './fill-world.type';

interface DeliverableLists {
  npc: LocationKey[];
  pond: LocationKey[];
  world: LocationKey[];
}

interface DeliverableSets {
  npc?: ReadonlySet<LocationKey>;
  capacity?: ReadonlySet<LocationKey>;
  world?: ReadonlySet<LocationKey>;
}

interface SnapshotFillFlags {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  shops: ShopScope;
  ponds: PondProfiles;
  pondSlotsFollowMode: boolean;
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting;
  difficulty: DifficultySetting;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  retroBow: RetroBowSetting;
  itemPower: ItemPowerSetting;
  dungeonItems: DungeonItemSetting;
  accessibility: AccessibilityMode;
}

type FillPickers = Pick<FillWorldOptions, 'pickBottle' | 'pickWeapon' | 'pickFiller'>;

interface FillRestrictiveInput {
  world: World;
  items: ItemKey[];
  locations: LocationKey[];
  assumedItems?: readonly ItemKey[];
  allowedAt?: (item: ItemKey, location: LocationKey) => boolean;
  relaxWhenBeatable?: boolean;
}

interface AssumedState {
  state: CollectionState;
  collectedLocations: Set<LocationKey>;
}

interface PlacementSphere {
  index: number;
  locations: LocationKey[];
}

interface PlacementSweep {
  spheres: PlacementSphere[];
  collected: Set<LocationKey>;
  uncollected: LocationKey[];
  missedEvents: CheckId[];
  beaten: boolean;
}

interface PlacementStatsInput {
  fillWorld: FillWorld;
  attempts: number;
  shufflePrizes: boolean;
  deliverable: Required<DeliverableSets>;
  sphereCount: number;
}

interface RollInput {
  values: OptionValues;
  options: FillWorldOptions;
  rng: Rng;
}

interface DungeonOwnership {
  locationDungeon: Map<LocationKey, string>;
  itemDungeon: Map<ItemKey, string>;
}

export type {
  AssumedState, DeliverableLists, DeliverableSets, DungeonOwnership, FillPickers, FillRestrictiveInput,
  PlacementSphere, PlacementStatsInput, PlacementSweep, RollInput, SnapshotFillFlags,
};
