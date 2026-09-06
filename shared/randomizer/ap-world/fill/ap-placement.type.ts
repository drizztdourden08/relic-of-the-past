/* @layer shared-game @kind types */
/**
 * The reference-faithful generator's output: the fixed vanilla medallion
 * pair, the complete location→item view (every location, pre-placed and
 * locked content included), the verification sweep's spheres, and
 * generation stats.
 */
import type { MedallionName } from '../item-names.data';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { PlacementSphere } from './verify-placement';
import type { CapacityPoolCounts, CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { PondSetting } from '../pond/pond-profile.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopPriceView } from '../shops/shop-price.type';

interface ApPlacementStats {
  /** 1-based attempt that produced the seed (retries are reseeded). */
  attempts: number;
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  /**
   * Whether the standing world items were shuffleable. Absent on placements
   * persisted before the scope split, which followed includeNpcChecks.
   */
  includeWorldItems?: boolean;
  /**
   * Whether the ten dungeon prizes were shuffled over the ten prize slots.
   * Absent on placements persisted before the option existed, which hold
   * each dungeon's vanilla prize and must keep being played that way.
   */
  shufflePrizes?: boolean;
  /**
   * How many npc-scope locations entered the shuffle (the caller's deliverable
   * set ∩ the scope table; 0 with the option off). Absent on placements
   * persisted before the capability probe existed.
   */
  npcDeliverableCount?: number;
  /** Same count over the world-item scope table. Absent on older placements. */
  worldDeliverableCount?: number;
  /**
   * Whether any capacity-fairy slot existed as a location for this seed.
   * Absent on placements persisted before the option existed (off).
   */
  capacityShuffle?: boolean;
  /**
   * How many fairy slots entered the shuffle (the caller's deliverable set ∩
   * the present slots; 0 when none exist). Absent on older placements.
   */
  capacityDeliverableCount?: number;
  /**
   * The capacity profile this seed was generated with. Absent on placements
   * persisted before the profile existed, which follow capacityShuffle
   * (placement-capacity.ts).
   */
  capacity?: CapacityProfile;
  /**
   * Whether the Custom families' items were progressive (one name per family,
   * pickups climb the plan in order). Absent on placements persisted before
   * the switch existed, which hold fixed-jump items (false).
   */
  capacityProgressive?: boolean;
  /**
   * What a capacity pickup handed over beside its ceiling, per family. Absent
   * on placements persisted before the rows existed, which read as the
   * baselines, which reproduce the goods a pickup gave then.
   */
  capacityBonus?: CapacityBonusSetting;
  /** Pool items per family and the filler they displaced. Absent on older placements. */
  capacityCounts?: CapacityPoolCounts;
  /**
   * The shelf scope this seed was generated with. Absent on placements
   * persisted before shops existed, which opened no slot, so the bridge
   * reads an absent value as a scope of zero and every shop stays vanilla.
   */
  shops?: ShopScope;
  /**
   * What the rupee pond sold for this seed. Absent on placements persisted
   * before the option existed, which keep the legacy pond, whose two slots
   * answer to the capacity families alone. The throw schedule is not stored:
   * it is re-derived from this setting and the placement's own seed, so a
   * spoiler, the logic and the running game always read the same one.
   */
  pond?: PondSetting;
  /**
   * Which tiers of each progressive family this seed was rolled with. Absent on
   * placements persisted before the rows existed, which carry every tier, so
   * the session arms the full ladder and the placement keeps its meaning.
   */
  progressiveTiers?: ProgressiveSetting;
  /**
   * How each family's copies arrived: nameless steps up the ladder, or the
   * rungs themselves in any order. Absent on placements persisted before the
   * rows existed, which are in order, and that is what the session arms.
   */
  progressiveModes?: ProgressiveModeSetting;
  /**
   * Whether the bow was fed rupees, not arrows, and what a shot cost.
   * Absent on placements persisted before the option existed, which found
   * arrows in the world and must keep being played that way.
   */
  retroBow?: RetroBowSetting;
  /**
   * How helpful the items were for this seed, AS ASKED FOR: the two derived
   * fallbacks are recomputed from the tier ticks at arming time instead of
   * frozen, so a stored placement and a live one always agree. Absent means the
   * reference's normal step, the unmodified game.
   */
  itemPower?: ItemPowerSetting;
  /**
   * Which items this seed counted as a light in an unlit room. Absent on
   * placements persisted before the rows existed, which were rolled with the
   * lamp as the only light, which is what the unmodified game does anyway, so
   * an absent value arms nothing and the seed keeps its meaning.
   */
  darkRooms?: DarkRoomSetting;
  /** How many pond prize slots existed as locations. Absent on older placements. */
  pondPrizeCount?: number;
  /**
   * Where each dungeon-item family was allowed to end up. Absent on placements
   * persisted before the rows were read, which were rolled with every family
   * pinned to its own dungeon.
   */
  dungeonItems?: DungeonItemSetting;
  /**
   * The accessibility contract this seed was verified against. Absent on
   * placements persisted before the row was read, which were all verified at
   * `full`.
   */
  accessibility?: AccessibilityMode;
  locationCount: number;
  sphereCount: number;
}

interface ApPlacement {
  seed: string;
  medallions: {
    mire: MedallionName;
    turtleRock: MedallionName;
  };
  /** Location name → item name, for EVERY location in the world. */
  nameView: Record<string, string>;
  /**
   * Shelf location → the price it charges, rolled once from this seed. Absent
   * on placements from before shop prices existed, and empty whenever no
   * currency was ticked: both mean every shelf charges its vanilla rupees.
   */
  shopPrices?: ShopPriceView;
  spheres: PlacementSphere[];
  stats: ApPlacementStats;
}

export type { ApPlacement, ApPlacementStats };
