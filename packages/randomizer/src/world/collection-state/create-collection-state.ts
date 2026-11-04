/* @layer shared-game @kind logic */
import { createCollectionState as createWorldState } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../rotp-keys.type';
import type { World } from '../world.type';
import type { CollectionState } from '../collection-state.type';

const createCollectionState = (world: World): CollectionState =>
  createWorldState<RotpKeys>(world) as CollectionState;

export { createCollectionState };
