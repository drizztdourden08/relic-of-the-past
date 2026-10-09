/* @layer shared-game @kind logic */
import { explosivesCapacity } from '../state-helpers-capacity';
import { bombsEverHeld } from '../events/bombs-record';
import { MAX_BOMBS_ASKED } from './state-helpers.constants';
import type { CollectionState } from '../collection-state.type';

const canUseBombs = (state: CollectionState, quantity = 1): boolean =>
  explosivesCapacity(state) >= Math.min(quantity, MAX_BOMBS_ASKED) && bombsEverHeld(state);

export { canUseBombs };
