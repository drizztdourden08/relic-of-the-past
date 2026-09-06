/* @layer shared-game @kind types */
/**
 * The assembled world model and its options — the seam between the graph
 * (phase P2) and the access rules that attach to it (phase P3). Rules are
 * looked up by exit/location name through getRule/getLocationRule; an absent
 * rule means unconditional access, mirroring the reference generator's
 * default access_rule (tests/fixtures/ap-source/generic-Rules.py set_rule
 * semantics). The rule registration pass (rules/register.ts) makes absence
 * explicit: every name ends up either ruled or listed always-open, and
 * anything else is registered blocked. placedItems is the fill seam — the
 * reference's location_item_name reads resolve against it (empty until a
 * fill phase populates it, which makes every placement-conditional rule take
 * its conservative branch).
 */
import type { ApDungeonDef, ApLocation, ApRegion } from './region.type';
import type { MedallionName } from './item-names.data';
import type { AccessibilityMode } from './accessibility/accessibility.type';
import type { DungeonItemSetting } from './dungeon-items/dungeon-item.type';
import type { CollectionState } from './collection-state';
import type { CapacityProfile } from './capacity/capacity-profile.type';
import type { DarkRoomSetting } from './dark-rooms/dark-room.type';
import type { DifficultySetting } from './difficulty/difficulty.type';
import type { ItemPowerSetting } from './item-power/item-power.type';
import type { PondSetting } from './pond/pond-profile.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from './progressive/progressive.type';
import type { RetroBowSetting } from './retro/retro.type';
import type { ShopScope } from './shops/shop-scope.type';
import type { ShopPriceView } from './shops/shop-price.type';

type Rule = (state: CollectionState) => boolean;

/** python add_item_rule/forbid_item — may this item be placed here? */
type ItemRule = (itemName: string) => boolean;

/** python set_always_allow — placement allowed even when unreachable. */
type AlwaysAllowRule = (state: CollectionState, itemName: string) => boolean;

interface ApWorldOptions {
  /** When false, the key-drop locations are left out of the world's pool view. */
  keyDropShuffle: boolean;
  /**
   * When false, the npc-scope locations (scope-vanilla.data.ts) keep their
   * vanilla items and those items leave the pool. Absent means true — the
   * fully-shuffleable world the oracles were generated against.
   */
  includeNpcChecks?: boolean;
  /**
   * The world-item half of the split scope toggle (scope-vanilla.data.ts).
   * Absent mirrors includeNpcChecks — the pre-split toggle covered both.
   */
  includeWorldItems?: boolean;
  /**
   * How each counter family with a ceiling is reshaped (capacity/). Absent
   * means the reference profile — the vanilla world every existing view and
   * oracle was built on: no fairy-slot locations, the half-meter item in the
   * pool, nothing else.
   */
  capacity?: CapacityProfile;
  /**
   * Custom families ship one progressive item each (pickups climb the plan
   * in order) instead of fixed-jump items. Absent means false: the
   * fixed-jump pool every earlier placement was generated from.
   */
  capacityProgressive?: boolean;
  /**
   * How many shelf slots the shops open as locations, and how many purchases
   * each opened slot carries (shops/shop-slots.ts). Absent means no shop
   * location exists at all — the world every earlier placement was built on.
   */
  shops?: ShopScope;
  /**
   * The price each opened shelf charges, rolled once from the seed. Absent
   * means no price was rolled and every shelf charges its vanilla rupees.
   */
  shopPrices?: ShopPriceView;
  /**
   * What the rupee pond sells (pond/). Absent means the legacy pond: its two
   * slots answer to the capacity families alone, exactly as before the option
   * existed, and no further prize slot is a location.
   */
  pond?: PondSetting;
  /**
   * The pond prize slots that exist in THIS world, in prize order. Absent
   * keeps the legacy derivation (the capacity families' present spots), so
   * every caller that predates the pond builds the same world it always did.
   */
  pondLocations?: readonly string[];
  /** Seed the pond's gamble schedule was drawn from; '' for every other mode. */
  pondSeed?: string;
  /**
   * What an unlit room asks for (dark-rooms/). Absent means the reference
   * reading — light required, the lamp alone providing it — which every
   * placement rolled before the settings existed was generated under.
   */
  darkRooms?: DarkRoomSetting;
  /**
   * Which tiers of each progressive family exist at all (progressive/).
   * Absent means every tier — the reference pool, and the world every
   * placement rolled before the rows existed was generated against.
   */
  progressiveTiers?: ProgressiveSetting;
  /**
   * How each family's copies arrive — nameless steps up the ladder, or the
   * rungs themselves in any order (progressive/). Absent means every family in
   * order, which is the reference reading every placement rolled before the
   * rows existed was generated against.
   */
  progressiveModes?: ProgressiveModeSetting;
  /**
   * How many copies of each tiered family the seed carries, and how high the
   * hearts climb (difficulty/). Absent means the reference pool — one copy per
   * rung and the game's own twenty-heart ceiling — which is what every
   * placement rolled before the rows existed was generated against.
   */
  difficulty?: DifficultySetting;
  /**
   * Whether the bow is fed rupees rather than arrows, and what a shot costs
   * (retro/). Absent means off — the pool and the rules every earlier placement
   * was rolled under.
   */
  retroBow?: RetroBowSetting;
  /**
   * How helpful the items are (item-power/). Absent means the reference's
   * normal step — the unmodified game every earlier placement was rolled
   * against.
   */
  itemPower?: ItemPowerSetting;
  /**
   * Parity seam, set only by the reference-oracle harness. The reference
   * leaves the opening escape's unlit spots ungated in the mode this app
   * always plays, so a placement IT generated may hold the light behind
   * them. Absent — every path the app itself takes — keeps those spots
   * under the dark-room requirement like every other unlit spot.
   */
  unlitEscapeExempt?: boolean;
  /**
   * Where each dungeon-item family may end up (dungeon-items/). Absent means
   * the reference baseline — every family pinned to the dungeon that owns it —
   * which is the world every placement rolled before the rows were read.
   */
  dungeonItems?: DungeonItemSetting;
  /**
   * How much of the seed has to be reachable (accessibility/). Absent means
   * `full`, the contract the generator enforced before the row was read; it
   * also decides which of the reference's self-locking allowances exist, since
   * every one but Rules.py 327-328 is guarded by `accessibility != 'full'`.
   */
  accessibility?: AccessibilityMode;
  /** The medallion requirements for the two gated entrances. */
  medallions: {
    mire: MedallionName;
    turtleRock: MedallionName;
  };
}

interface ApWorld {
  regions: ReadonlyMap<string, ApRegion>;
  locationsByName: ReadonlyMap<string, ApLocation>;
  dungeons: ReadonlyMap<string, ApDungeonDef>;
  options: ApWorldOptions;
  /** Access rules by exit name — populated by rules/register.ts. */
  rules: Map<string, Rule>;
  /** Access rules by location name — populated by rules/register.ts. */
  locationRules: Map<string, Rule>;
  /** Placement predicates by location name (forbid_item and friends). */
  itemRules: Map<string, ItemRule>;
  /** python always_allow by location name (self-locking key allowances). */
  alwaysAllow: Map<string, AlwaysAllowRule>;
  /** Fill seam: location name → placed item name (empty before a fill). */
  placedItems: Map<string, string>;
  getRule(name: string): Rule | undefined;
  getLocationRule(name: string): Rule | undefined;
  /** Absent entry means every item is allowed (reference default). */
  getItemRule(name: string): ItemRule;
  /** python completion_condition for the boss-defeat goal. */
  isBeaten(state: CollectionState): boolean;
}

export type { Rule, ItemRule, AlwaysAllowRule, ApWorldOptions, ApWorld };
