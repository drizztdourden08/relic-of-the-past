/* @layer shared-game @kind logic */
/**
 * Region reachability sweep: port of the reference generator's
 * update_reachable_regions / can_reach semantics (python BaseClasses, as
 * exercised by Archipelago worlds/alttp/Regions.py). The sweep starts from
 * the start region and repeats full passes until no new region is admitted:
 * a rule may read the partially built reachable set (event logic), and the
 * retry passes mirror the python blocked-connection retries. Rules are
 * monotone in collected items and reachability, so the fixpoint terminates.
 */
import { REGION_NAME } from './item-names.data';
import type { ApWorld } from './world.type';
import type { CollectionState } from './collection-state';

const updateReachableRegions = (state: CollectionState, world: ApWorld): void => {
  if (!state.staleReachability) return;
  state.staleReachability = false;
  const reachable = state.reachableRegions;
  reachable.clear();
  if (world.regions.has(REGION_NAME.start)) reachable.add(REGION_NAME.start);

  let changed = true;
  while (changed) {
    changed = false;
    for (const region of world.regions.values()) {
      if (!reachable.has(region.name)) continue;
      for (const exit of region.exits) {
        if (reachable.has(exit.target)) continue;
        const rule = world.getRule(exit.name);
        if (rule === undefined || rule(state)) {
          reachable.add(exit.target);
          changed = true;
        }
      }
    }
  }
};

/** Fresh sweep from the start region; returns a copy of the reachable set. */
const computeReachableRegions = (state: CollectionState, world: ApWorld): Set<string> => {
  state.staleReachability = true;
  updateReachableRegions(state, world);
  return new Set(state.reachableRegions);
};

export { updateReachableRegions, computeReachableRegions };
