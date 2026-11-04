/* @layer shared-game @kind logic */
import type { RegionId } from '@rotp/game-data';
import { ROTP_WORLD_KIT } from './rotp-world-kit.constants';
import type { World } from './world.type';
import type { CollectionState } from './collection-state.type';

const computeReachableRegions = (state: CollectionState, world: World): Set<RegionId> =>
  ROTP_WORLD_KIT.computeReachableRegions(state, world);

export { computeReachableRegions };
