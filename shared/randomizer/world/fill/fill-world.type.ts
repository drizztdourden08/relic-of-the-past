/* @layer shared-game @kind types */
/**
 * The fill-facing world bundle. Unlike the plain graph constructor (which
 * drops the key-drop locations when that option is off, matching the P2
 * region-view tests), the fill world ALWAYS carries the full location graph:
 * with the option off, the drop locations stay in the world, are excluded
 * from fill, and sit pre-placed with their vanilla keys (the reference locks
 * them via place_locked_item, ItemPool.py 349-369). lockedVanilla records
 * exactly those pre-placements.
 */
import type { ActToken } from '../events/event-gate.type';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { MedallionId } from '../item-groups';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { World } from '../world.type';
import type { ItemPool } from '../pool/item-pool.type';
import type { BottlePicker } from '../pool/build-item-pool';
import type { WeaponPicker } from '../pool/uncle-weapon';
import type { FillerPicker } from '../pool/balance-filler';
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
  /** Absent means true: the fully-shuffleable world the oracles pin. */
  includeNpcChecks?: boolean;
  /** Absent mirrors includeNpcChecks, since the pre-split synthetic toggle covered both. */
  includeWorldItems?: boolean;
  /**
   * With the npc option ON: the scope locations proven physically deliverable
   * by the app's capability probe, so only these enter the shuffle, the rest of
   * the scope set stays locked vanilla. Absent keeps the fully-shuffleable
   * oracle view; the generation entry point always passes a concrete set.
   */
  deliverableNpcLocations?: ReadonlySet<LocationKey>;
  /** Same probe contract, over the world-item scope table. */
  deliverableWorldLocations?: ReadonlySet<LocationKey>;
  /** Absent means the reference profile: no fairy slot exists. */
  capacity?: CapacityProfile;
  /** Custom families as progressive items (absent: fixed-jump items). */
  capacityProgressive?: boolean;
  /** What a capacity pickup hands over beside its ceiling (absent: the baselines). */
  capacityBonus?: CapacityBonusSetting;
  /**
   * For the families whose fairy slot exists: the slots proven physically
   * deliverable by the app's capability probe, so only these enter the
   * shuffle. Absent locks every present slot to its vanilla upgrade (unlike
   * the npc set there is no fully-shuffleable oracle view to preserve).
   */
  deliverableCapacityLocations?: ReadonlySet<LocationKey>;
  /**
   * How many shelf slots open as locations and how deep each one stocks.
   * Absent means no shop location exists, the world the oracles pin.
   */
  shops?: ShopScope;
  /** Prices rolled for the opened shelves; absent keeps every vanilla price. */
  shopPrices?: ShopPriceView;
  /**
   * What each of the three ponds sells (pond/). Absent means every pond
   * legacy: their slots answer to their vanilla grants alone.
   */
  ponds?: PondProfiles;
  /**
   * What each pond rung demands, rolled once from the seed (pond/). Absent
   * rolls nothing and every rung keeps the wallet reading of its own price.
   */
  pondDemands?: PondDemandView;
  /**
   * Whether a wish pond's mode decides her two vanilla slots: locked at
   * Vanilla grants, closed under a Custom pond that carries rungs
   * (pond/pond-vanilla-slots.ts). Absent means false, where those slots answer
   * to the npc scope alone: the oracles' world.
   */
  pondSlotsFollowMode?: boolean;
  /**
   * What an unlit room asks for (dark-rooms/). Absent means the reference
   * reading the oracles pin: light required, the lamp alone providing it.
   */
  darkRooms?: DarkRoomSetting;
  /**
   * Which recorded event each story gate reads (story-gates/). Absent means the story as
   * the game tells it.
   */
  storyGates?: StoryGateSetting;
  /**
   * The acts a player's own record says are done, by token (events/). Only a tracker reading
   * a live file passes one; a fill has no record, so it is absent there and every act falls
   * back to the capability that performs it.
   */
  actTokens?: ReadonlySet<ActToken>;
  /**
   * Which tiers of each progressive family exist (progressive/). Absent means
   * every tier: the reference pool.
   */
  progressiveTiers?: ProgressiveSetting;
  /**
   * How each family's copies arrive (progressive/). Absent means every family
   * in order: the reference reading.
   */
  progressiveModes?: ProgressiveModeSetting;
  /**
   * How many copies of each tiered family the seed carries, and how high the
   * hearts climb (difficulty/). Absent means the reference pool: one copy per
   * rung and the game's own twenty-heart ceiling, which the oracles pin.
   */
  difficulty?: DifficultySetting;
  /**
   * Whether the bow is fed rupees, not arrows, and what a shot costs
   * (retro/). Absent means off, which is the pool and the rules the oracles pin.
   */
  retroBow?: RetroBowSetting;
  /**
   * How helpful the items are (item-power/). Absent means the reference's
   * normal step, the unmodified game.
   */
  itemPower?: ItemPowerSetting;
  /**
   * Where each dungeon-item family may end up (dungeon-items/). Absent means
   * the reference baseline: every family pinned to its own dungeon.
   */
  dungeonItems?: DungeonItemSetting;
  /**
   * How much of the seed has to be reachable (accessibility/). Absent means
   * `full`, and the pruned always-allow
   * registry that goes with it.
   */
  accessibility?: AccessibilityMode;
  /** Parity seam for the reference-oracle harness, see WorldOptions. */
  unlitEscapeExempt?: boolean;
  medallions: {
    mire: MedallionId;
    turtleRock: MedallionId;
  };
  /** Cosmetic bottle-content picker forwarded to the pool builder. */
  pickBottle?: BottlePicker;
  /**
   * Standard-mode starting-weapon picker (ItemPool.py 294-318). Present:
   * the assurance runs and the chosen weapon is locked onto the mentor
   * check. Absent: no assurance, the parity path, which loads a finished
   * placement over the world.
   */
  pickWeapon?: WeaponPicker;
  /** Picks which filler leaves for a capacity upgrade; absent removes the last one. */
  pickFiller?: FillerPicker;
}

interface FillWorld {
  world: World;
  /** The requested option: world.options.keyDropShuffle is always true here. */
  keyDropShuffle: boolean;
  /** The requested npc-scope option (true = those locations are fillable). */
  includeNpcChecks: boolean;
  /** The requested world-item scope option (true = those locations are fillable). */
  includeWorldItems: boolean;
  /** The capacity profile the world and pool were built for. */
  capacity: CapacityProfile;
  /** Whether the Custom families' items are progressive (one name, plan order) or fixed-jump. */
  capacityProgressive: boolean;
  /** What a capacity pickup hands over beside its ceiling, recorded so the session arms the seed's own. */
  capacityBonus: CapacityBonusSetting;
  /** The shop scope the world was built for: no slots means shops stayed vanilla. */
  shops: ShopScope;
  /** What each opened shelf charges; empty means every shelf kept its vanilla price. */
  shopPrices: ShopPriceView;
  /** Pool items per family and the filler they displaced. */
  capacityCounts: CapacityPoolCounts;
  /** The pond settings the world and pool were built for, one per pond. */
  ponds: PondProfiles;
  /** Whether the wish ponds' modes decided their vanilla slots, recorded so a placement says so. */
  pondSlotsFollowMode: boolean;
  /** What an unlit room asks for in this world. */
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting;
  /** The tier ticks the world and pool were built for. */
  progressiveTiers: ProgressiveSetting;
  /** How each family's copies arrive: in order, or the rungs themselves. */
  progressiveModes: ProgressiveModeSetting;
  /** How many copies each tiered family carries, and the ceiling on the hearts. */
  difficulty: DifficultySetting;
  /** Whether arrows are bought, not found, and what they cost. */
  retroBow: RetroBowSetting;
  /** How helpful the items are in this world (as asked for, before the masks). */
  itemPower: ItemPowerSetting;
  /** Where each dungeon-item family may end up in this world. */
  dungeonItems: DungeonItemSetting;
  /** How much of this world has to be reachable for the seed to be valid. */
  accessibility: AccessibilityMode;
  /** The pond prize slots that exist here, in prize order. */
  pondLocations: readonly LocationKey[];
  /** Pool built for the REQUESTED option (dungeon sets shrink when off). */
  pool: ItemPool;
  /** Drop location → vanilla key, pre-placed and fill-excluded (off mode only). */
  lockedVanilla: ReadonlyMap<LocationKey, ItemKey>;
  /** Location name → owning dungeon name, for the restricted prefill. */
  locationDungeon: ReadonlyMap<LocationKey, string>;
  /** Dungeon item name → its dungeon name (keys, big keys, maps, compasses). */
  itemDungeon: ReadonlyMap<ItemKey, string>;
}

export type { FillWorld, FillWorldOptions };
