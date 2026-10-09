/* @layer shared-game @kind logic */
import { CRYSTAL_ITEMS } from '../item-groups';
import type { CollectionState } from '../collection-state.type';

const hasCrystals = (state: CollectionState, count: number): boolean =>
  state.countGroup(CRYSTAL_ITEMS) >= count;

export { hasCrystals };
