/* @layer shared-game @kind logic */
import { ROTP_WORLD_KIT } from '../rotp-world-kit.constants';
import type { World } from '../world.type';
import type { CollectionState } from '../collection-state.type';

const createCollectionState = (world: World): CollectionState =>
  ROTP_WORLD_KIT.createCollectionState(world) as CollectionState;

export { createCollectionState };
