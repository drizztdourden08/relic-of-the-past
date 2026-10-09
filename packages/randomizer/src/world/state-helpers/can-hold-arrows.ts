/* @layer shared-game @kind logic */
import { projectilesCapacity } from '../state-helpers-capacity';
import type { CollectionState } from '../collection-state.type';

const canHoldArrows = (state: CollectionState, quantity: number): boolean =>
  quantity <= projectilesCapacity(state);

export { canHoldArrows };
