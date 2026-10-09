/* @layer shared-game @kind logic */
import { REGION } from './region-ids.data';
import type { World } from './world.type';
import type { CollectionState } from './collection-state.type';

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
      if (!reachable.has(region.id)) continue;
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

export { updateReachableRegions };
