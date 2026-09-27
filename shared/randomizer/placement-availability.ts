/* @layer shared-game @kind logic */
/**
 * Tracker-facing availability over a frozen placement. The player's logical
 * inventory is the multiset of items sitting at the locations they have
 * already completed (per the placement's locations), plus every event and
 * dungeon-prize slot whose location is in logic for that inventory, the
 * reference sweep's semantics: an in-logic slot's content counts because the
 * player can go take it. A location is available when its region and access
 * rule pass under that state and it is not already completed.
 *
 * The world is rebuilt from the placement's own frozen record (the key-drop
 * option, the capacity profile, the medallion pair) and the locations is loaded over the
 * fill seam, the same replay idiom the standard-mode verification uses, so
 * availability always answers for THIS seed under the ported rules, never
 * the hand-authored normal dataset.
 */
import { REFERENCE_DARK_ROOM_SETTING } from './world/dark-rooms';
import { buildFillWorld } from './world/fill/fill-world';
import { DEFAULT_STORY_GATES } from './world/story-gates/story-gates.data';
import { capacityBonusOfStats, capacityProfileOfStats, capacityProgressiveOfStats } from './world/fill/placement-capacity';
import { pondProfilesOfStats } from './world/fill/placement-ponds';
import { actTokensOf, isCertifiedAct } from './world/events/event-gates';
import { createCollectionState } from './world/collection-state';
import { computeReachableRegions } from './world/graph';
import { canCollectLocation } from './world/rules/collect';
import type { RegionId } from '../game/data/types/ids';
import type { World } from './world/world.type';
import type { CollectionState } from './world/collection-state';
import type { ActToken } from './world/events/event-gate.type';
import type { ItemKey } from './world/item-ids.data';
import type { LocationKey } from './world/location-key';
import type { Placement } from './world/fill/placement.type';

/**
 * Every setting the fill actually read when it built this placement, so the
 * rebuild here sees the same world it was generated against. A field left
 * out silently falls back to buildFillWorld's OWN reference default (the
 * lamp-only escape, no shops, every progressive tier) instead of the seed's
 * real one, which is how the escape sequence stayed unreachable for a
 * player who lit their way with a Fire Rod or Cane of Somaria: the rebuilt
 * world asked for a Lamp specifically, no matter what the placement recorded.
 */
const worldFromPlacement = (
  placement: Placement,
  darkRoomsNeedLight: boolean,
  actTokens: ReadonlySet<ActToken> | undefined,
): World => {
  const { stats } = placement;
  // The tracker's own switch: off reads every unlit room as walked in the dark, whatever the seed asked.
  const darkRooms = darkRoomsNeedLight ? stats.darkRooms
    : { ...(stats.darkRooms ?? REFERENCE_DARK_ROOM_SETTING), requireLight: false };
  const { world } = buildFillWorld({
    keyDropShuffle: stats.keyDropShuffle,
    includeNpcChecks: stats.includeNpcChecks,
    includeWorldItems: stats.includeWorldItems,
    capacity: capacityProfileOfStats(stats),
    capacityProgressive: capacityProgressiveOfStats(stats),
    capacityBonus: capacityBonusOfStats(stats),
    shops: stats.shops,
    shopPrices: placement.shopPrices,
    ponds: pondProfilesOfStats(stats),
    pondSlotsFollowMode: stats.pondSlotsFollowMode === true,
    pondDemands: placement.pondDemands,
    darkRooms,
    storyGates: stats.storyGates ?? DEFAULT_STORY_GATES,
    ...(actTokens === undefined ? {} : { actTokens }),
    progressiveTiers: stats.progressiveTiers,
    progressiveModes: stats.progressiveModes,
    retroBow: stats.retroBow,
    itemPower: stats.itemPower,
    dungeonItems: stats.dungeonItems,
    accessibility: stats.accessibility,
    medallions: placement.medallions,
  });
  for (const [location, item] of Object.entries(placement.locations)) {
    world.placedItems.set(location as LocationKey, item);
  }
  return world;
};

/**
 * Fixpoint sweep over the auto-granted slots (event and prize locations):
 * an in-logic slot's content joins the inventory, which can open more.
 *
 * With a record of what the player did attached, an act the record certifies is left out of
 * the sweep: whether the floodgate is open is a fact the game wrote down, not something to
 * infer from the lever being within walking distance. An event no check certifies (the
 * capacity fairy) has no other source, so it keeps the sweep.
 */
const sweepAutoGrantedSlots = (state: CollectionState, world: World, readsRecord: boolean): void => {
  const collected = new Set<LocationKey>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const location of world.locationsByKey.values()) {
      if (!location.event && !location.prize) continue;
      if (collected.has(location.key)) continue;
      const item = world.placedItems.get(location.key);
      if (readsRecord && location.event && item !== undefined && isCertifiedAct(item)) continue;
      if (!canCollectLocation(state, location.key)) continue;
      if (item !== undefined) state.collect(item);
      collected.add(location.key);
      changed = true;
    }
  }
};

interface PlacementReach {
  /** Locations in logic and not yet completed. */
  available: Set<LocationKey>;
  /** The regions the player can reach, by id, for whoever needs the place. */
  reachableRegions: Set<RegionId>;
}

/**
 * Where the player can be and what they can take, from one sweep of one state, so nothing has to
 * build the world twice to ask the two halves of the same question.
 */
const computePlacementReach = (
  placement: Placement,
  completedLocations: ReadonlySet<LocationKey>,
  darkRoomsNeedLight = true,
  /**
   * What the player is actually holding. A location's item is not the only way to be holding
   * something: a gift from another world, a cheat grant, or a pickup whose own location was
   * never detected all put an item in hand that no completed location accounts for. Absent
   * means the older reading, items at completed locations alone. An item listed twice is held
   * twice, which is how a counted item such as a small key is handed over.
   */
  heldItems: Iterable<ItemKey> = [],
  /**
   * The dataset checks the player has completed, ids and all, so the acts among them can be
   * read as the acts they are (events/). Absent means no record is attached and every act
   * falls back to the capability that would perform it, which is what a fill answers under.
   */
  completedCheckIds?: Iterable<string>,
): PlacementReach => {
  const actTokens = completedCheckIds === undefined ? undefined : actTokensOf(completedCheckIds);
  const world = worldFromPlacement(placement, darkRoomsNeedLight, actTokens);
  const state = createCollectionState(world);

  for (const key of completedLocations) {
    const item = placement.locations[key];
    if (item !== undefined) state.collect(item);
  }
  for (const item of heldItems) state.collect(item);
  for (const token of actTokens ?? []) state.collect(token);
  sweepAutoGrantedSlots(state, world, actTokens !== undefined);

  const available = new Set<LocationKey>();
  for (const key of world.locationsByKey.keys()) {
    if (completedLocations.has(key)) continue;
    if (canCollectLocation(state, key)) available.add(key);
  }
  return { available, reachableRegions: computeReachableRegions(state, world) };
};

/** The availability half alone, for callers with no use for the regions. */
const computePlacementAvailability = (
  ...args: Parameters<typeof computePlacementReach>
): Set<string> => computePlacementReach(...args).available;

export { computePlacementAvailability, computePlacementReach };
export type { PlacementReach };
