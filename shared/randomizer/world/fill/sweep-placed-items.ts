/* @layer shared-game @kind logic */
import { canCollectLocation } from '../rules/collect';
import { reachableEvents } from '../events/event-sweep';
import type { LocationKey } from '../location-key';
import type { AssumedState } from './fill.type';

const sweepPlacedItems = (assumed: AssumedState): void => {
  const { state, collectedLocations } = assumed;
  const { placedItems } = state.world;
  let changed = true;
  while (changed) {
    changed = false;
    const batch: LocationKey[] = [];
    for (const key of placedItems.keys()) {
      if (!collectedLocations.has(key) && canCollectLocation(state, key)) batch.push(key);
    }
    const events = reachableEvents(state);
    for (const key of batch) {
      collectedLocations.add(key);
      const item = placedItems.get(key);
      if (item !== undefined) state.collect(item);
      changed = true;
    }
    for (const event of events) state.collect(event);
    if (events.length > 0) changed = true;
  }
};

export { sweepPlacedItems };
