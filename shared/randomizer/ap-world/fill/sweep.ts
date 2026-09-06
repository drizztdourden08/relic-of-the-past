/* @layer shared-game @kind logic */
/**
 * The assumed-state sweep the fill runs before every placement: the port of
 * the reference's sweep_from_pool + sweep_for_advancements: start from the
 * assumed inventory (the still-unplaced pool), then repeatedly collect the
 * items sitting on already-placed locations that are collectable, in sphere
 * batches, until a fixpoint. Placed non-advancement items are collected too
 * (no rule reads their names, so this is behavior-neutral and keeps the
 * bookkeeping to one map).
 */
import { createCollectionState } from '../collection-state';
import { canCollectLocation } from '../rules/collect';
import type { ApWorld } from '../world.type';
import type { CollectionState } from '../collection-state';

interface AssumedState {
  state: CollectionState;
  /** Locations whose placed item has been collected by the sweep. */
  collectedLocations: Set<string>;
}

const sweepPlacedItems = (assumed: AssumedState): void => {
  const { state, collectedLocations } = assumed;
  const { placedItems } = state.world;
  let changed = true;
  while (changed) {
    changed = false;
    const batch: string[] = [];
    for (const name of placedItems.keys()) {
      if (!collectedLocations.has(name) && canCollectLocation(state, name)) batch.push(name);
    }
    for (const name of batch) {
      collectedLocations.add(name);
      const item = placedItems.get(name);
      if (item !== undefined) state.collect(item);
      changed = true;
    }
  }
};

const createAssumedState = (world: ApWorld, assumedItems: Iterable<string>): AssumedState => {
  const state = createCollectionState(world);
  for (const item of assumedItems) state.collect(item);
  const assumed: AssumedState = { state, collectedLocations: new Set<string>() };
  sweepPlacedItems(assumed);
  return assumed;
};

export { createAssumedState, sweepPlacedItems };
export type { AssumedState };
