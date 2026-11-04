/* @layer shared-game @kind logic */
import { computeReachableRegions as computeWorldRegions } from '@drizztdourden08/brock-randomizer/world';
import type { RegionId } from '@rotp/game-data';
import type { RotpKeys } from './rotp-keys.type';
import type { World } from './world.type';
import type { CollectionState } from './collection-state.type';

const computeReachableRegions = (state: CollectionState, world: World): Set<RegionId> =>
  computeWorldRegions<RotpKeys>(state, world);

export { computeReachableRegions };
