/* @layer shared-game @kind logic */
/**
 * Location collectability and the event sweep. canCollectLocation mirrors
 * the reference's Location.can_reach (region reachable + access rule);
 * sweepEvents mirrors sweep_for_advancements restricted to the locked event
 * items: repeatedly collect every event whose location is collectable until
 * a fixpoint, so chained events (the trades behind other events) resolve.
 */
import { EVENT_ITEMS } from '../pool/event-items.data';
import type { CollectionState } from '../collection-state';

const canCollectLocation = (state: CollectionState, name: string): boolean => {
  const location = state.world.locationsByName.get(name);
  if (location === undefined) return false;
  if (!state.canReachRegion(location.region)) return false;
  const rule = state.world.getLocationRule(name);
  return rule === undefined || rule(state);
};

const collectableLocations = (state: CollectionState): string[] =>
  [...state.world.locationsByName.keys()].filter((name) => canCollectLocation(state, name));

const sweepEvents = (state: CollectionState): void => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [locationName, itemName] of EVENT_ITEMS) {
      if (state.has(itemName)) continue;
      if (canCollectLocation(state, locationName)) {
        state.collect(itemName);
        changed = true;
      }
    }
  }
};

export { canCollectLocation, collectableLocations, sweepEvents };
