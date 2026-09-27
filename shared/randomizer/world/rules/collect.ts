/* @layer shared-game @kind logic */
/**
 * Location collectability and the event sweep. canCollectLocation mirrors
 * the reference's Location.can_reach (region reachable + access rule);
 * sweepEvents mirrors sweep_for_advancements restricted to the locked event
 * items: repeatedly collect every event whose location is collectable until
 * a fixpoint, so chained events (the trades behind other events) resolve.
 */
import { EVENT_ITEMS } from '../pool/event-items.data';
import type { LocationKey } from '../location-key';
import type { CollectionState } from '../collection-state';

const canCollectLocation = (state: CollectionState, key: LocationKey): boolean => {
  const location = state.world.locationsByKey.get(key);
  if (location === undefined) return false;
  if (!state.canReachRegion(location.region)) return false;
  const rule = state.world.getLocationRule(key);
  return rule === undefined || rule(state);
};

const collectableLocations = (state: CollectionState): LocationKey[] =>
  [...state.world.locationsByKey.keys()].filter((key) => canCollectLocation(state, key));

const sweepEvents = (state: CollectionState): void => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [location, item] of EVENT_ITEMS) {
      if (state.has(item)) continue;
      if (canCollectLocation(state, location)) {
        state.collect(item);
        changed = true;
      }
    }
  }
};

export { canCollectLocation, collectableLocations, sweepEvents };
