/* @layer shared-game @kind logic */
/**
 * Port of the reference generator's fill_restrictive (Fill.py, single-player
 * path): pop one item at a time off the end of the pool, compute the maximum
 * exploration state assuming everything still unplaced, place at the first
 * candidate in the (caller-shuffled) location list that accepts it, and on a
 * miss try the swap pass: displace an earlier placement whose slot accepts
 * this item, requeueing the displaced item to be placed last. Documented
 * simplifications against the source, none of which can deadlock the
 * baseline because the caller retries with a fresh seed on failure:
 * - the swap's reachable-location-count non-decrease guard is skipped (the
 *   final full-accessibility sweep rejects any bad outcome instead);
 * - a placement miss after the swap pass throws immediately instead of
 *   parking the item in unplaced_items (the source raises at the end anyway
 *   when unplaced items remain and partial fills are not allowed);
 * - progression balancing is not ported (it redistributes valid placements,
 *   it never creates or repairs validity).
 */
import { canCollectLocation } from '../rules/collect';
import { createAssumedState } from './sweep';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { CollectionState } from '../collection-state';

class FillError extends Error {
  readonly item: string;

  constructor(item: string, detail: string) {
    super(`no fillable location for ${item} (${detail})`);
    this.name = 'FillError';
    this.item = item;
  }
}

/**
 * python Location.can_fill: item rule, then always_allow OR reachability.
 * |checkAccess| is the source's own `check_access` argument, where false drops the
 * reachability half entirely, which is what minimal accessibility asks for
 * once the goal is already reachable (Fill.py, perform_access_check).
 */
const canFillLocation = (
  state: CollectionState, location: LocationKey, item: ItemKey, checkAccess = true,
): boolean => {
  const { world } = state;
  if (!world.getItemRule(location)(item)) return false;
  const allow = world.alwaysAllow.get(location);
  if (allow !== undefined && allow(state, item)) return true;
  return !checkAccess || canCollectLocation(state, location);
};

interface FillRestrictiveInput {
  world: World;
  /** Consumed from the end (mutated), so shuffle before calling. */
  items: ItemKey[];
  /** Candidate locations in scan order (mutated), so shuffle before calling. */
  locations: LocationKey[];
  /** Items assumed owned throughout, on top of the still-unplaced ones. */
  assumedItems?: readonly ItemKey[];
  /** Extra placement restriction (the dungeon prefill's own-dungeon rule). */
  allowedAt?: (item: ItemKey, location: LocationKey) => boolean;
  /**
   * Minimal accessibility: once the assumed state already beats the game, the
   * source stops requiring a spot to be reachable (Fill.py, "if minimal
   * accessibility, only check whether location is reachable if game not
   * beatable"). Absent keeps the check on for every placement, which is what
   * the other two contracts ask for.
   */
  relaxWhenBeatable?: boolean;
}

const fillRestrictive = (input: FillRestrictiveInput): void => {
  const { world, items, locations, assumedItems = [], allowedAt, relaxWhenBeatable = false } = input;
  const placedHere: LocationKey[] = [];
  const swapCounts = new Map<ItemKey, number>();

  const fits = (
    state: CollectionState, item: ItemKey, location: LocationKey, checkAccess: boolean,
  ): boolean =>
    (allowedAt === undefined || allowedAt(item, location))
      && canFillLocation(state, location, item, checkAccess);

  while (items.length > 0) {
    const item = items.pop() as ItemKey;
    const assumed = createAssumedState(world, [...assumedItems, ...items]);
    const checkAccess = !relaxWhenBeatable || !world.isBeaten(assumed.state);
    const spotIndex = locations.findIndex((key) => fits(assumed.state, item, key, checkAccess));

    if (spotIndex >= 0) {
      const spot = locations.splice(spotIndex, 1)[0];
      world.placedItems.set(spot, item);
      placedHere.push(spot);
      continue;
    }

    // Swap pass: an item may be swapped out at most twice (source guard).
    let swapped = false;
    for (const spot of placedHere) {
      const displaced = world.placedItems.get(spot);
      if (displaced === undefined || (swapCounts.get(displaced) ?? 0) > 1) continue;
      world.placedItems.delete(spot);
      const swapState = createAssumedState(world, [...assumedItems, ...items]);
      if (fits(swapState.state, item, spot, checkAccess)) {
        world.placedItems.set(spot, item);
        swapCounts.set(displaced, (swapCounts.get(displaced) ?? 0) + 1);
        // Requeued at the front so it is placed last (the pool pops the end).
        items.unshift(displaced);
        swapped = true;
        break;
      }
      world.placedItems.set(spot, displaced);
    }
    if (!swapped) {
      throw new FillError(item,
        `${items.length} items left, ${locations.length} open locations, ${placedHere.length} placed`);
    }
  }
};

export { FillError, canFillLocation, fillRestrictive };
export type { FillRestrictiveInput };
