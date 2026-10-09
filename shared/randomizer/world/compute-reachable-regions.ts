/* @layer shared-game @kind logic */
import { updateReachableRegions } from './update-reachable-regions';
import type { RegionId } from '@rotp/game-data';
import type { World } from './world.type';
import type { CollectionState } from './collection-state.type';

const computeReachableRegions = (state: CollectionState, world: World): Set<RegionId> => {
  state.staleReachability = true;
  updateReachableRegions(state, world);
  return new Set(state.reachableRegions);
};

export { computeReachableRegions };
