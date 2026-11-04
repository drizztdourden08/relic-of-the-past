/* @layer shared-game @kind types */
import type {
  AssumedState as WorldAssumedState, FillRestrictiveInput as WorldFillRestrictiveInput,
  PlacementSphere as WorldPlacementSphere, PlacementSweep as WorldPlacementSweep,
} from '@drizztdourden08/brock-randomizer/world';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { RotpWorld } from '../world.type';
import type { Rng } from '../../rng';
import type { OptionValues, RandomizerOptionsSnapshot } from '../options.type';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { DarkRoomSetting, ItemPowerSetting } from '@rotp/game-core';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
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

interface GenerateRequest {
  seed: string;
  snapshot: RandomizerOptionsSnapshot;
  deliverable?: DeliverableSets;
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

type FillRestrictiveInput = WorldFillRestrictiveInput<RotpWorld>;

type AssumedState = WorldAssumedState<RotpWorld>;

type PlacementSphere = WorldPlacementSphere<RotpWorld>;

type PlacementSweep = WorldPlacementSweep<RotpWorld>;

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
  AssumedState, DeliverableLists, DeliverableSets, DungeonOwnership, FillPickers, FillRestrictiveInput, GenerateRequest,
  PlacementSphere, PlacementStatsInput, PlacementSweep, RollInput, SnapshotFillFlags,
};
