/* @layer shared-game @kind logic */
/**
 * The assumed-state sweep the fill runs before every placement: the port of
 * the reference's sweep_from_pool + sweep_for_advancements: start from the
 * assumed inventory (the still-unplaced pool), then repeatedly collect the
 * items sitting on already-placed locations that are collectable, in sphere
 * batches, until a fixpoint. Placed non-advancement items are collected too
 * (no rule reads their names, so this is behavior-neutral and keeps the
 * bookkeeping to one map). Each batch also grants the story events within
 * reach of the same state (events/event-sweep.ts).
 */
import { createCollectionState } from '../collection-state';
import { canCollectLocation } from '../rules/collect';
import { reachableEvents } from '../events/event-sweep';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';
import type { CollectionState } from '../collection-state';

interface AssumedState {
  state: CollectionState;
  /** Locations whose placed item has been collected by the sweep. */
  collectedLocations: Set<LocationKey>;
}

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

const createAssumedState = (world: World, assumedItems: Iterable<ItemKey>): AssumedState => {
  const state = createCollectionState(world);
  for (const item of assumedItems) state.collect(item);
  const assumed: AssumedState = { state, collectedLocations: new Set<LocationKey>() };
  sweepPlacedItems(assumed);
  return assumed;
};

export { createAssumedState, sweepPlacedItems };
export type { AssumedState };
