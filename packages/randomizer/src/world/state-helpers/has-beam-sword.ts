/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { CollectionState } from '../collection-state.type';

const hasBeamSword = (state: CollectionState): boolean =>
  state.hasAny([ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]);

export { hasBeamSword };
