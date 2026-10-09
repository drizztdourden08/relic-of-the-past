/* @layer shared-game @kind logic */
import { createCollectionState } from '../collection-state';
import { canCollectLocation } from '../rules/collect';
import { reachableEvents } from '../events/event-sweep';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { PlacementSphere, PlacementSweep } from './fill.type';

const sweepPlacementSpheres = (world: World): PlacementSweep => {
  const state = createCollectionState(world);
  const collected = new Set<LocationKey>();
  const spheres: PlacementSphere[] = [];
  for (;;) {
    const batch = [...world.locationsByKey.keys()]
      .filter((key) => !collected.has(key) && canCollectLocation(state, key));
    const events = reachableEvents(state);
    if (batch.length === 0 && events.length === 0) break;
    for (const key of batch) {
      collected.add(key);
      const item = world.placedItems.get(key);
      if (item !== undefined) state.collect(item);
    }
    for (const event of events) state.collect(event);
    const roundHoldsLocations = batch.length > 0;
    if (roundHoldsLocations) spheres.push({ index: spheres.length, locations: batch });
  }
  const uncollected = [...world.locationsByKey.keys()].filter((key) => !collected.has(key));
  const missedEvents = [...world.eventsByKey.keys()].filter((key) => !state.has(key));
  return { spheres, collected, uncollected, missedEvents, beaten: world.isBeaten(state) };
};

export { sweepPlacementSpheres };
