/* @layer shared-game @kind logic */
import { actTokensOf } from '../world/events/event-gates';
import { createCollectionState } from '../world/collection-state';
import type { CollectionState } from '../world/collection-state';
import { computeReachableRegions } from '../world/compute-reachable-regions';
import { canCollectLocation } from '../world/rules/collect';
import { countsOf } from './counts-of';
import { sweepAutoGrantedSlots } from './sweep-auto-granted-slots';
import { worldFromPlacement } from './world-from-placement';
import type { ItemKey } from '../world/item-ids';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';
import type { World } from '../world/world.type';
import type { PlacementReach, ReachRequest } from './placement-availability.type';

const collectCompleted = (state: CollectionState, placement: Placement, completed: ReadonlySet<LocationKey>): void => {
  for (const key of completed) {
    const item = placement.locations[key];
    if (item !== undefined) state.collect(item);
  }
};

const collectHeld = (state: CollectionState, heldItems: Iterable<ItemKey>): void => {
  for (const [item, floor] of countsOf(heldItems)) {
    while (state.count(item) < floor) state.collect(item);
  }
};

const availableLocations = (state: CollectionState, world: World, completed: ReadonlySet<LocationKey>): Set<LocationKey> => {
  const available = new Set<LocationKey>();
  for (const key of world.locationsByKey.keys()) {
    if (completed.has(key)) continue;
    if (canCollectLocation(state, key)) available.add(key);
  }
  return available;
};

const computePlacementReach = (request: ReachRequest): PlacementReach => {
  const { placement, completedLocations, darkRoomsNeedLight = true, heldItems = [], completedCheckIds } = request;
  const actTokens = completedCheckIds === undefined ? undefined : actTokensOf(completedCheckIds);
  const world = worldFromPlacement(placement, darkRoomsNeedLight, actTokens);
  const state = createCollectionState(world);

  collectCompleted(state, placement, completedLocations);
  collectHeld(state, heldItems);
  for (const token of actTokens ?? []) state.collect(token);
  sweepAutoGrantedSlots(state, world, actTokens !== undefined, completedLocations);

  return {
    available: availableLocations(state, world, completedLocations),
    reachableRegions: computeReachableRegions(state, world),
  };
};

export { computePlacementReach };
