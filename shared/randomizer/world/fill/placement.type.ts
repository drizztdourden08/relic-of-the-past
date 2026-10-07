/* @layer shared-game @kind types */
/**
 * The reference-faithful generator's output: the fixed vanilla medallion
 * pair, what every location holds (pre-placed and locked content included),
 * the verification sweep's spheres, and generation stats. Locations and items
 * are ids throughout.
 */
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { MedallionId } from '../item-groups';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import type { StoryGateSetting } from '../story-gates/story-gate.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { PlacementSphere } from './verify-placement';
import type { CapacityPoolCounts, CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopPriceView } from '../shops/shop-price.type';

interface PlacementStats {
  /** 1-based attempt that produced the seed (retries are reseeded). */
  attempts: number;
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  /** Whether the standing world items were shuffleable. */
  includeWorldItems: boolean;
  /** Whether the ten dungeon prizes were shuffled over the ten prize slots. */
  shufflePrizes: boolean;
  /**
   * How many npc-scope locations entered the shuffle (the caller's deliverable
   * set ∩ the scope table; 0 with the option off).
   */
  npcDeliverableCount: number;
  /** Same count over the world-item scope table. */
  worldDeliverableCount: number;
  /**
   * How many fairy slots entered the shuffle (the caller's deliverable set ∩
   * the present slots; 0 when none exist).
   */
  capacityDeliverableCount: number;
  /** The capacity profile this seed was generated with. */
  capacity: CapacityProfile;
  /**
   * Whether the Custom families' items were progressive (one name per family,
   * pickups climb the plan in order).
   */
  capacityProgressive: boolean;
  /** What a capacity pickup handed over beside its ceiling, per family. */
  capacityBonus: CapacityBonusSetting;
  /** Pool items per family and the filler they displaced. */
  capacityCounts: CapacityPoolCounts;
  /** The shelf scope this seed was generated with. */
  shops: ShopScope;
  /**
   * What each pond sold for this seed. A throw schedule is not stored: it is
   * re-derived from these settings and the placement's own seed, so a spoiler,
   * the logic and the running game always read the same one.
   */
  ponds: PondProfiles;
  /** Which tiers of each progressive family this seed was rolled with. */
  progressiveTiers: ProgressiveSetting;
  /**
   * How each family's copies arrived: nameless steps up the ladder, or the
   * rungs themselves in any order.
   */
  progressiveModes: ProgressiveModeSetting;
  /** Whether the bow was fed rupees, not arrows, and what a shot cost. */
  retroBow: RetroBowSetting;
  /**
   * How helpful the items were for this seed, AS ASKED FOR: the two derived
   * fallbacks are recomputed from the tier ticks at arming time instead of
   * frozen, so a stored placement and a live one always agree.
   */
  itemPower: ItemPowerSetting;
  /** Which items this seed counted as a light in an unlit room. */
  darkRooms: DarkRoomSetting;
  /** Which recorded event each story gate reads and what the counts ask for. */
  storyGates: StoryGateSetting;
  /** How many pond prize slots existed as locations. */
  pondPrizeCount: number;
  /**
   * True when each wish pond's mode decided her two vanilla slots: locked at
   * Vanilla grants, not locations under a Custom pond with rungs
   * (pond/pond-vanilla-slots.ts). False where those slots answer to the npc
   * scope alone.
   */
  pondSlotsFollowMode: boolean;
  /** Where each dungeon-item family was allowed to end up. */
  dungeonItems: DungeonItemSetting;
  /** The accessibility contract this seed was verified against. */
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
  /**
   * Location key to the item placed there, for EVERY location in the world. Keys, so a record
   * relabelled tomorrow leaves this untouched; what a row is CALLED is read off the record
   * when it is shown (placement-name-view.ts).
   */
  locations: Record<LocationKey, ItemKey>;
  /**
   * Shelf location → the price it charges, rolled once from this seed. Empty
   * whenever no currency was ticked, and then every shelf charges its vanilla
   * rupees.
   */
  shopPrices: ShopPriceView;
  /**
   * Pond rung → the demand its fairy makes, rolled once from this seed. Empty
   * whenever no pond rolled one, and then every rung asks for the rupees its
   * ladder charges.
   */
  pondDemands: PondDemandView;
  spheres: PlacementSphere[];
  stats: PlacementStats;
}

export type { Placement, PlacementStats };
