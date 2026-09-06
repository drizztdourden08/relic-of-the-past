/* @layer shared-game @kind types */
/**
 * The fill-facing world bundle. Unlike the plain graph constructor (which
 * drops the key-drop locations when that option is off, matching the P2
 * region-view tests), the fill world ALWAYS carries the full location graph:
 * with the option off, the drop locations stay in the world, are excluded
 * from fill, and sit pre-placed with their vanilla keys (the reference locks
 * them via place_locked_item — ItemPool.py 349-369). lockedVanilla records
 * exactly those pre-placements.
 */
import type { MedallionName } from '../item-names.data';
import type { AccessibilityMode } from '../accessibility/accessibility.type';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { ApWorld } from '../world.type';
import type { ApItemPool } from '../pool/item-pool.type';
import type { BottlePicker } from '../pool/build-item-pool';
import type { WeaponPicker } from '../pool/uncle-weapon';
import type { FillerPicker } from '../pool/balance-filler';
import type { CapacityPoolCounts, CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { DarkRoomSetting } from '../dark-rooms/dark-room.type';
import type { DifficultySetting } from '../difficulty/difficulty.type';
import type { ItemPowerSetting } from '../item-power/item-power.type';
import type { PondSetting } from '../pond/pond-profile.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from '../progressive/progressive.type';
import type { RetroBowSetting } from '../retro/retro.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopPriceView } from '../shops/shop-price.type';

interface FillWorldOptions {
  keyDropShuffle: boolean;
  /** Absent means true — the fully-shuffleable world the oracles pin. */
  includeNpcChecks?: boolean;
  /** Absent mirrors includeNpcChecks — the pre-split synthetic toggle covered both. */
  includeWorldItems?: boolean;
  /**
   * With the npc option ON: the scope locations proven physically deliverable
   * by the app's capability probe — only these enter the shuffle, the rest of
   * the scope set stays locked vanilla. Absent keeps the fully-shuffleable
   * oracle view; the generation entry point always passes a concrete set.
   */
  deliverableNpcLocations?: ReadonlySet<string>;
  /** Same probe contract, over the world-item scope table. */
  deliverableWorldLocations?: ReadonlySet<string>;
  /** Absent means the reference profile — no fairy slot exists. */
  capacity?: CapacityProfile;
  /** Custom families as progressive items (absent: fixed-jump items). */
  capacityProgressive?: boolean;
  /** What a capacity pickup hands over beside its ceiling (absent: the baselines). */
  capacityBonus?: CapacityBonusSetting;
  /**
   * For the families whose fairy slot exists: the slots proven physically
   * deliverable by the app's capability probe — only these enter the
   * shuffle. Absent locks every present slot to its vanilla upgrade (unlike
   * the npc set there is no fully-shuffleable oracle view to preserve).
   */
  deliverableCapacityLocations?: ReadonlySet<string>;
  /**
   * How many shelf slots open as locations and how deep each one stocks.
   * Absent means no shop location exists — the world the oracles pin.
   */
  shops?: ShopScope;
  /** Prices rolled for the opened shelves; absent keeps every vanilla price. */
  shopPrices?: ShopPriceView;
  /**
   * What the rupee pond sells (pond/). Absent means the legacy pond: its two
   * slots answer to the capacity families alone, exactly as before.
   */
  pond?: PondSetting;
  /** Seed the pond's gamble schedule is drawn from; only Gamble reads it. */
  pondSeed?: string;
  /**
   * What an unlit room asks for (dark-rooms/). Absent means the reference
   * reading the oracles pin: light required, the lamp alone providing it.
   */
  darkRooms?: DarkRoomSetting;
  /**
   * Which tiers of each progressive family exist (progressive/). Absent means
   * every tier — the reference pool every earlier placement was built from.
   */
  progressiveTiers?: ProgressiveSetting;
  /**
   * How each family's copies arrive (progressive/). Absent means every family
   * in order — the reference reading every earlier placement was built from.
   */
  progressiveModes?: ProgressiveModeSetting;
  /**
   * How many copies of each tiered family the seed carries, and how high the
   * hearts climb (difficulty/). Absent means the reference pool — one copy per
   * rung and the game's own twenty-heart ceiling — which the oracles pin.
   */
  difficulty?: DifficultySetting;
  /**
   * Whether the bow is fed rupees rather than arrows, and what a shot costs
   * (retro/). Absent means off, which is the pool and the rules the oracles pin.
   */
  retroBow?: RetroBowSetting;
  /**
   * How helpful the items are (item-power/). Absent means the reference's
   * normal step — the unmodified game every earlier placement was rolled
   * against.
   */
  itemPower?: ItemPowerSetting;
  /**
   * Where each dungeon-item family may end up (dungeon-items/). Absent means
   * the reference baseline — every family pinned to its own dungeon — which is
   * what every placement rolled before the rows were read.
   */
  dungeonItems?: DungeonItemSetting;
  /**
   * How much of the seed has to be reachable (accessibility/). Absent means
   * `full`: the generator's original contract, and the pruned always-allow
   * registry that goes with it.
   */
  accessibility?: AccessibilityMode;
  /** Parity seam for the reference-oracle harness — see ApWorldOptions. */
  unlitEscapeExempt?: boolean;
  medallions: {
    mire: MedallionName;
    turtleRock: MedallionName;
  };
  /** Cosmetic bottle-content picker forwarded to the pool builder. */
  pickBottle?: BottlePicker;
  /**
   * Standard-mode starting-weapon picker (ItemPool.py 294-318). Present:
   * the assurance runs and the chosen weapon is locked onto the mentor
   * check. Absent: no assurance — the parity path, which loads a finished
   * placement over the world.
   */
  pickWeapon?: WeaponPicker;
  /** Picks which filler leaves for a capacity upgrade; absent removes the last one. */
  pickFiller?: FillerPicker;
}

interface FillWorld {
  world: ApWorld;
  /** The requested option — world.options.keyDropShuffle is always true here. */
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
  /** The shop scope the world was built for — no slots means shops stayed vanilla. */
  shops: ShopScope;
  /** What each opened shelf charges; empty means every shelf kept its vanilla price. */
  shopPrices: ShopPriceView;
  /** Pool items per family and the filler they displaced. */
  capacityCounts: CapacityPoolCounts;
  /** The pond setting the world and pool were built for. */
  pond: PondSetting;
  /** What an unlit room asks for in this world. */
  darkRooms: DarkRoomSetting;
  /** The tier ticks the world and pool were built for. */
  progressiveTiers: ProgressiveSetting;
  /** How each family's copies arrive — in order, or the rungs themselves. */
  progressiveModes: ProgressiveModeSetting;
  /** How many copies each tiered family carries, and the ceiling on the hearts. */
  difficulty: DifficultySetting;
  /** Whether arrows are bought rather than found, and what they cost. */
  retroBow: RetroBowSetting;
  /** How helpful the items are in this world (as asked for, before the masks). */
  itemPower: ItemPowerSetting;
  /** Where each dungeon-item family may end up in this world. */
  dungeonItems: DungeonItemSetting;
  /** How much of this world has to be reachable for the seed to be valid. */
  accessibility: AccessibilityMode;
  /** The seed the pond's gamble schedule was drawn from. */
  pondSeed: string;
  /** The pond prize slots that exist here, in prize order. */
  pondLocations: readonly string[];
  /** Pool built for the REQUESTED option (dungeon sets shrink when off). */
  pool: ApItemPool;
  /** Drop location → vanilla key, pre-placed and fill-excluded (off mode only). */
  lockedVanilla: ReadonlyMap<string, string>;
  /** Location name → owning dungeon name, for the restricted prefill. */
  locationDungeon: ReadonlyMap<string, string>;
  /** Dungeon item name → its dungeon name (keys, big keys, maps, compasses). */
  itemDungeon: ReadonlyMap<string, string>;
}

export type { FillWorld, FillWorldOptions };
