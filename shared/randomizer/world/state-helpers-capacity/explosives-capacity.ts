/* @layer shared-game @kind logic */
import { EXPLOSIVES } from '../capacity/capacity-family';
import { countedCapacity } from './counted-capacity';
import type { CollectionState } from '../collection-state.type';

const explosivesCapacity = (state: CollectionState): number => countedCapacity(state, EXPLOSIVES);

export { explosivesCapacity };
