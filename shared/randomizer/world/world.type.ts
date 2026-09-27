/* @layer shared-game @kind types */
/**
 * The assembled world model and its options: the seam between the graph
 * (phase P2) and the access rules that attach to it (phase P3). An exit is
 * looked up by name, a location by its own key (location-key.ts); an absent
 * rule means unconditional access, mirroring the reference generator's
 * default access_rule (Archipelago worlds/generic/Rules.py set_rule
 * semantics). The rule registration pass (rules/register.ts) makes absence
 * explicit: every target ends up either ruled or registered open. placedItems
 * is the fill seam, the reference's location_item_name reads resolve against
 * it (empty until a fill phase populates it, which makes every
 * placement-conditional rule take its conservative branch).
 */
import type { RegionId } from '@shared/game/data/types/ids';
import type { WorldDungeon, WorldLocation, Region } from './region.type';
import type { ItemKey } from './item-ids.data';
import type { LocationKey } from './location-key';
import type { MedallionId } from './item-groups';
import type { ActToken } from './events/event-gate.type';
import type { AccessibilityMode } from './accessibility/accessibility.type';
import type { DungeonItemSetting } from './dungeon-items/dungeon-item.type';
import type { CollectionState } from './collection-state';
import type { CapacityProfile } from './capacity/capacity-profile.type';
import type { DarkRoomSetting } from './dark-rooms/dark-room.type';
import type { DifficultySetting } from './difficulty/difficulty.type';
import type { StoryGateSetting } from './story-gates/story-gate.type';
import type { ItemPowerSetting } from './item-power/item-power.type';
import type { PondDemandView } from './pond/pond-ask.type';
import type { PondProfiles } from './pond/pond-profiles.type';
import type { ProgressiveModeSetting, ProgressiveSetting } from './progressive/progressive.type';
import type { RetroBowSetting } from './retro/retro.type';
import type { ShopScope } from './shops/shop-scope.type';
import type { ShopPriceView } from './shops/shop-price.type';

type Rule = (state: CollectionState) => boolean;

/** python add_item_rule/forbid_item: may this item be placed here? */
type ItemRule = (item: ItemKey) => boolean;

/** python set_always_allow: placement allowed even when unreachable. */
type AlwaysAllowRule = (state: CollectionState, item: ItemKey) => boolean;

interface WorldOptions {
  /** When false, the key-drop locations are left out of the world's pool view. */
  keyDropShuffle: boolean;
  /**
   * When false, the npc-scope locations (scope-vanilla.data.ts) keep their
   * vanilla items and those items leave the pool. Absent means true, the
   * fully-shuffleable world the oracles were generated against.
   */
  includeNpcChecks?: boolean;
  /**
   * The world-item half of the split scope toggle (scope-vanilla.data.ts).
   * Absent mirrors includeNpcChecks, since the pre-split toggle covered both.
   */
  includeWorldItems?: boolean;
  /**
   * How each counter family with a ceiling is reshaped (capacity/). Absent
   * means the reference profile: the vanilla world every existing view and
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
   * location exists at all: the world every earlier placement was built on.
   */
  shops?: ShopScope;
  /**
   * The price each opened shelf charges, rolled once from the seed. Absent
   * means no price was rolled and every shelf charges its vanilla rupees.
   */
  shopPrices?: ShopPriceView;
  /**
   * What each of the three ponds sells (pond/). Absent means every pond
   * legacy: their slots answer to their vanilla grants alone, exactly as
   * before the option existed, and no further prize slot is a location.
   */
  ponds?: PondProfiles;
  /**
   * Every pond slot that exists in THIS world, in pond then prize order
   * (pond/pond-spots.ts). A pond slot is a location only when it is listed
   * here, so an empty list is a world with no pond slot at all.
   */
  pondLocations: readonly LocationKey[];
  /**
   * The narrower set of those that are PRIZE slots: the rungs a pond sells, and the capacity
   * pond's fairy spots while it is at Vanilla grants (pond/pond-spots.ts). A wish pond's own
   * pair is not one, because the npc scope has always counted it, and the pool's arithmetic
   * reads this list to know how many spots the pond added.
   */
  pondPrizeLocations: readonly LocationKey[];
  /**
   * The wish ponds' own pairs that this world sells as prize rungs instead of
   * vanilla grants (pond/pond-vanilla-slots.ts). They are still locations, as
   * rungs 1 and 2; what they lose is the vanilla item the npc scope would lock
   * them to, and the pool's filler arithmetic reads the count.
   */
  pondPairAsPrizes?: readonly LocationKey[];
  /**
   * The wish ponds' vanilla slots locked at Vanilla grants, each to the item her
   * upgrade produces there, which leaves the pool (pool/pond-grant-subtraction.ts).
   * Absent locks nothing this way.
   */
  lockedPondGrants?: ReadonlyMap<LocationKey, ItemKey>;
  /**
   * What each pond rung demands, rolled once from the seed (pond/). Absent
   * means nothing was rolled: every rung keeps the wallet reading of its own
   * price, which is the only thing a pond ever asked for before.
   */
  pondDemands?: PondDemandView;
  /**
   * What an unlit room asks for (dark-rooms/). Absent means the reference
   * reading (light required, the lamp alone providing it) which every
   * placement rolled before the settings existed was generated under.
   */
  darkRooms?: DarkRoomSetting;
  /**
   * What each story moment asks for (story-gates/). Absent means the story as the game
   * tells it, which is what the rules asked for before the setting reached them.
   */
  storyGates?: StoryGateSetting;
  /**
   * Which tiers of each progressive family exist at all (progressive/).
   * Absent means every tier: the reference pool, and the world every
   * placement rolled before the rows existed was generated against.
   */
  progressiveTiers?: ProgressiveSetting;
  /**
   * How each family's copies arrive: nameless steps up the ladder, or the
   * rungs themselves in any order (progressive/). Absent means every family in
   * order, which is the reference reading every placement rolled before the
   * rows existed was generated against.
   */
  progressiveModes?: ProgressiveModeSetting;
  /**
   * How many copies of each tiered family the seed carries, and how high the
   * hearts climb (difficulty/). Absent means the reference pool: one copy per
   * rung and the game's own twenty-heart ceiling, which is what every
   * placement rolled before the rows existed was generated against.
   */
  difficulty?: DifficultySetting;
  /**
   * Whether the bow is fed rupees, not arrows, and what a shot costs
   * (retro/). Absent means off: the pool and the rules every earlier placement
   * was rolled under.
   */
  retroBow?: RetroBowSetting;
  /**
   * How helpful the items are (item-power/). Absent means the reference's
   * normal step, the unmodified game every earlier placement was rolled
   * against.
   */
  itemPower?: ItemPowerSetting;
  /**
   * Parity seam, set only by the reference-oracle harness. The reference
   * leaves the opening escape's unlit spots ungated in the mode this app
   * always plays, so a placement IT generated may hold the light behind
   * them. Absent (every path the app itself takes) keeps those spots
   * under the dark-room requirement like every other unlit spot.
   */
  unlitEscapeExempt?: boolean;
  /**
   * Where each dungeon-item family may end up (dungeon-items/). Absent means
   * the reference baseline (every family pinned to the dungeon that owns it)
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
  /**
   * The acts the player's own record says are done, by token (events/). Present means this
   * world answers from what happened: an act it does not list has not happened, and one the
   * rules cannot judge from an inventory reads as not done. Absent means no record is
   * attached, which is every fill, so such an act is assumed available.
   */
  actTokens?: ReadonlySet<ActToken>;
  /** The medallion requirements for the two gated entrances. */
  medallions: {
    mire: MedallionId;
    turtleRock: MedallionId;
  };
}

interface World {
  regions: ReadonlyMap<RegionId, Region>;
  locationsByKey: ReadonlyMap<LocationKey, WorldLocation>;
  dungeons: ReadonlyMap<string, WorldDungeon>;
  options: WorldOptions;
  /** Access rules by exit name, populated by rules/register.ts. */
  rules: Map<string, Rule>;
  /** Access rules by location key, populated by rules/register.ts. */
  locationRules: Map<LocationKey, Rule>;
  /** Placement predicates by location key (forbid_item and friends). */
  itemRules: Map<LocationKey, ItemRule>;
  /** python always_allow by location key (self-locking key allowances). */
  alwaysAllow: Map<LocationKey, AlwaysAllowRule>;
  /** Fill seam: location key to the item placed there (empty before a fill). */
  placedItems: Map<LocationKey, ItemKey>;
  getRule(name: string): Rule | undefined;
  getLocationRule(key: LocationKey): Rule | undefined;
  /** Absent entry means every item is allowed (reference default). */
  getItemRule(key: LocationKey): ItemRule;
  /** python completion_condition for the boss-defeat goal. */
  isBeaten(state: CollectionState): boolean;
}

export type { Rule, ItemRule, AlwaysAllowRule, WorldOptions, World };
