/* @layer shared-game @kind logic */
import { canCollectLocation } from './can-collect-location';
import type { LocationKey } from '../../location-key.type';
import type { CollectionState } from '../../collection-state.type';

const collectableLocations = (state: CollectionState): LocationKey[] =>
  [...state.world.locationsByKey.keys()].filter((key) => canCollectLocation(state, key));

export { collectableLocations };
