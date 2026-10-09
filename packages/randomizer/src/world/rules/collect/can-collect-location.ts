/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key.type';
import type { CollectionState } from '../../collection-state.type';

const canCollectLocation = (state: CollectionState, key: LocationKey): boolean => {
  const location = state.world.locationsByKey.get(key);
  if (location === undefined) return false;
  if (!state.canReachRegion(location.region)) return false;
  const rule = state.world.getLocationRule(key);
  return rule === undefined || rule(state);
};

export { canCollectLocation };
