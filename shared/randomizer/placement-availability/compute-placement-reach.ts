/* @layer shared-game @kind logic */
import { actTokensOf } from '../world/events/event-gates';
import { createCollectionState } from '../world/collection-state';
import { computeReachableRegions } from '../world/graph';
import { canCollectLocation } from '../world/rules/collect';
import { countsOf } from './counts-of';
import { sweepAutoGrantedSlots } from './sweep-auto-granted-slots';
import { worldFromPlacement } from './world-from-placement';
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';
import type { PlacementReach } from './placement-availability.type';

const computePlacementReach = (
  placement: Placement,
  completedLocations: ReadonlySet<LocationKey>,
  darkRoomsNeedLight = true,
  heldItems: Iterable<ItemKey> = [],
  completedCheckIds?: Iterable<string>,
): PlacementReach => {
  const actTokens = completedCheckIds === undefined ? undefined : actTokensOf(completedCheckIds);
  const world = worldFromPlacement(placement, darkRoomsNeedLight, actTokens);
  const state = createCollectionState(world);

  for (const key of completedLocations) {
    const item = placement.locations[key];
    if (item !== undefined) state.collect(item);
  }
  for (const [item, floor] of countsOf(heldItems)) {
    while (state.count(item) < floor) state.collect(item);
  }
  for (const token of actTokens ?? []) state.collect(token);
  sweepAutoGrantedSlots(state, world, actTokens !== undefined, completedLocations);

  const available = new Set<LocationKey>();
  for (const key of world.locationsByKey.keys()) {
    if (completedLocations.has(key)) continue;
    if (canCollectLocation(state, key)) available.add(key);
  }
  return { available, reachableRegions: computeReachableRegions(state, world) };
};

export { computePlacementReach };
