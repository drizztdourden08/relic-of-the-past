/* @layer shared-game @kind logic */
import { REGION } from './region-ids.constants';
import type { World } from './world.type';
import type { CollectionState } from './collection-state.type';
import type { Region } from './region.type';

const openExitsOf = (region: Region, state: CollectionState, world: World): boolean => {
  const reachable = state.reachableRegions;
  let changed = false;
  for (const exit of region.exits) {
    if (reachable.has(exit.target)) continue;
    const rule = world.getRule(exit.name);
    if (rule === undefined || rule(state)) {
      reachable.add(exit.target);
      changed = true;
    }
  }
  return changed;
};

const updateReachableRegions = (state: CollectionState, world: World): void => {
  if (!state.staleReachability) return;
  state.staleReachability = false;
  const reachable = state.reachableRegions;
  reachable.clear();
  if (world.regions.has(REGION.start)) reachable.add(REGION.start);
  let changed = true;
  while (changed) {
    changed = false;
    for (const region of world.regions.values()) {
      if (reachable.has(region.id) && openExitsOf(region, state, world)) changed = true;
    }
  }
};

export { updateReachableRegions };
