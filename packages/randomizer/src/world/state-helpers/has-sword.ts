/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { CollectionState } from '../collection-state.type';

const hasSword = (state: CollectionState): boolean =>
  state.hasAny([ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword]);

export { hasSword };
