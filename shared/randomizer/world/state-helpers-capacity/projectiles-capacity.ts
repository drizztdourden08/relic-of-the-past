/* @layer shared-game @kind logic */
import { PROJECTILES } from '../capacity/capacity-family';
import { countedCapacity } from './counted-capacity';
import type { CollectionState } from '../collection-state.type';

const projectilesCapacity = (state: CollectionState): number => countedCapacity(state, PROJECTILES);

export { projectilesCapacity };
