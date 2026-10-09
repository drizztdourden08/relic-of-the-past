/* @layer shared-game @kind types */
import type { ActToken } from '../events/event-gate.type';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { MedallionId } from '../item-groups';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { World } from '../world.type';
import type { ItemPool } from '../pool/item-pool.type';
import type { BottlePicker, FillerPicker, WeaponPicker } from '../pool/pool.type';
import type { CapacityPoolCounts, CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopPriceView } from '../shops/shop-price.type';

interface FillWorldOptions {
  keyDropShuffle: boolean;
  includeNpcChecks?: boolean;
  includeWorldItems?: boolean;
  deliverableNpcLocations?: ReadonlySet<LocationKey>;
  deliverableWorldLocations?: ReadonlySet<LocationKey>;
  capacity?: CapacityProfile;
  capacityProgressive?: boolean;
  capacityBonus?: CapacityBonusSetting;
  deliverableCapacityLocations?: ReadonlySet<LocationKey>;
  shops?: ShopScope;
  shopPrices?: ShopPriceView;
  ponds?: PondProfiles;
  pondDemands?: PondDemandView;
  pondSlotsFollowMode?: boolean;
  darkRooms?: DarkRoomSetting;
  storyGates?: StoryGateSetting;
  actTokens?: ReadonlySet<ActToken>;
  progressiveTiers?: ProgressiveSetting;
  progressiveModes?: ProgressiveModeSetting;
  difficulty?: DifficultySetting;
  retroBow?: RetroBowSetting;
  itemPower?: ItemPowerSetting;
  dungeonItems?: DungeonItemSetting;
  accessibility?: AccessibilityMode;
  unlitEscapeExempt?: boolean;
  medallions: {
    mire: MedallionId;
    turtleRock: MedallionId;
  };
  pickBottle?: BottlePicker;
  pickWeapon?: WeaponPicker;
  pickFiller?: FillerPicker;
}

interface FillWorld {
  world: World;
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  shops: ShopScope;
  shopPrices: ShopPriceView;
  capacityCounts: CapacityPoolCounts;
  ponds: PondProfiles;
  pondSlotsFollowMode: boolean;
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  difficulty: DifficultySetting;
  retroBow: RetroBowSetting;
  itemPower: ItemPowerSetting;
  dungeonItems: DungeonItemSetting;
  accessibility: AccessibilityMode;
  pondLocations: readonly LocationKey[];
  pool: ItemPool;
  lockedVanilla: ReadonlyMap<LocationKey, ItemKey>;
  locationDungeon: ReadonlyMap<LocationKey, string>;
  itemDungeon: ReadonlyMap<ItemKey, string>;
}

export type { FillWorld, FillWorldOptions };
