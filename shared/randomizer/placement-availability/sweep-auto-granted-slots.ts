/* @layer shared-game @kind logic */
import { collectReachableEvents } from '../world/events/event-sweep';
import { canCollectLocation } from '../world/rules/collect';
import type { World } from '../world/world.type';
import type { CollectionState } from '../world/collection-state';
import type { LocationKey } from '../world/location-key';

const sweepAutoGrantedSlots = (
  state: CollectionState, world: World, readsRecord: boolean,
  alreadyCollected: ReadonlySet<LocationKey>,
): void => {
  if (readsRecord) return;
  const collected = new Set<LocationKey>(alreadyCollected);
  let changed = true;
  while (changed) {
    changed = false;
    collectReachableEvents(state);
    for (const location of world.locationsByKey.values()) {
      if (!location.prize || collected.has(location.key)) continue;
      if (!canCollectLocation(state, location.key)) continue;
      const item = world.placedItems.get(location.key);
      if (item !== undefined) state.collect(item);
      collected.add(location.key);
      changed = true;
    }
  }
};

export { sweepAutoGrantedSlots };
