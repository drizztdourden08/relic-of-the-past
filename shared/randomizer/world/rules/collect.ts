/* @layer shared-game @kind logic */
/**
 * Location collectability: canCollectLocation mirrors the reference's Location.can_reach (region
 * reachable + access rule). The story events have their own reading (events/event-sweep.ts).
 */
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

export { canCollectLocation, collectableLocations };
