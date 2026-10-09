/* @layer shared-game @kind logic */
import { createCollectionState } from '../collection-state';
import { sweepPlacedItems } from './sweep-placed-items';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { AssumedState } from './fill.type';

const createAssumedState = (world: World, assumedItems: Iterable<ItemKey>): AssumedState => {
  const state = createCollectionState(world);
  for (const item of assumedItems) state.collect(item);
  const assumed: AssumedState = { state, collectedLocations: new Set<LocationKey>() };
  sweepPlacedItems(assumed);
  return assumed;
};

export { createAssumedState };
