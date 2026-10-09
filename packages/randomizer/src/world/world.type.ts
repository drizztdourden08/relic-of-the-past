/* @layer shared-game @kind types */
import type { CheckId, RegionId } from '@rotp/game-data';
import type { WorldDungeon, WorldEvent, WorldLocation, Region } from './region.type';
import type { ItemKey } from './item-ids';
import type { LocationKey } from './location-key.type';
import type { MedallionId } from './item-groups';
import type { ActToken } from './events/event-gate.type';
import type { AccessibilityMode } from './accessibility/accessibility.type';
import type { DungeonItemSetting } from './dungeon-items/dungeon-item.type';
import type { CollectionState } from './collection-state.type';
import type { CapacityProfile } from './capacity/capacity-profile.type';
import type { DarkRoomSetting, ItemPowerSetting } from '@rotp/game-core';
import type { DifficultySetting } from './difficulty/difficulty.type';
import type { StoryGateSetting } from './story-gates/story-gate.type';
import type { PondDemandView } from './pond/pond-ask.type';
import type { PondProfiles } from './pond/pond-profiles.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from './progressive/progressive.type';
import type { RetroBowSetting } from './retro/retro.type';
import type { ShopScope } from './shops/shop-scope.type';
import type { ShopPriceView } from './shops/shop-price.type';
import type { RuleNode } from './rules/rule-node.type';

type Rule = ((state: CollectionState) => boolean) & { readonly node: RuleNode };

type SeedValue = string | number | boolean;

type ItemRule = (item: ItemKey) => boolean;

type AlwaysAllowRule = (state: CollectionState, item: ItemKey) => boolean;

interface WorldOptions {
  keyDropShuffle: boolean;
  includeNpcChecks?: boolean;
  includeWorldItems?: boolean;
  capacity?: CapacityProfile;
  capacityProgressive?: boolean;
  shops?: ShopScope;
  shopPrices?: ShopPriceView;
  ponds?: PondProfiles;
  pondLocations: readonly LocationKey[];
  pondPrizeLocations: readonly LocationKey[];
  pondPairAsPrizes?: readonly LocationKey[];
  lockedPondGrants?: ReadonlyMap<LocationKey, ItemKey>;
  pondDemands?: PondDemandView;
  darkRooms?: DarkRoomSetting;
  storyGates?: StoryGateSetting;
  progressiveTiers?: ProgressiveSetting;
  progressiveModes?: ProgressiveModeSetting;
  difficulty?: DifficultySetting;
  retroBow?: RetroBowSetting;
  itemPower?: ItemPowerSetting;
  unlitEscapeExempt?: boolean;
  dungeonItems?: DungeonItemSetting;
  accessibility?: AccessibilityMode;
  actTokens?: ReadonlySet<ActToken>;
  medallions: {
    mire: MedallionId;
    turtleRock: MedallionId;
  };
}

interface World {
  regions: ReadonlyMap<RegionId, Region>;
  locationsByKey: ReadonlyMap<LocationKey, WorldLocation>;
  eventsByKey: ReadonlyMap<CheckId, WorldEvent>;
  dungeons: ReadonlyMap<string, WorldDungeon>;
  options: WorldOptions;
  rules: Map<string, Rule>;
  locationRules: Map<LocationKey, Rule>;
  eventRules: Map<CheckId, Rule>;
  itemRules: Map<LocationKey, ItemRule>;
  alwaysAllow: Map<LocationKey, AlwaysAllowRule>;
  placedItems: Map<LocationKey, ItemKey>;
  seedValues: Map<string, SeedValue>;
  getRule(name: string): Rule | undefined;
  getLocationRule(key: LocationKey): Rule | undefined;
  getEventRule(key: CheckId): Rule | undefined;
  getItemRule(key: LocationKey): ItemRule;
  isBeaten(state: CollectionState): boolean;
}

export type { Rule, ItemRule, AlwaysAllowRule, SeedValue, WorldOptions, World };
