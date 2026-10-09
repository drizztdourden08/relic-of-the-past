/* @layer shared-game @kind logic */
import { BOTTLE_ITEMS } from '../item-groups';
import { BASELINE } from './state-helpers.constants';
import type { CollectionState } from '../collection-state.type';

const bottleCount = (state: CollectionState): number =>
  Math.min(BASELINE.progressiveBottleLimit, state.countGroup(BOTTLE_ITEMS));

export { bottleCount };
