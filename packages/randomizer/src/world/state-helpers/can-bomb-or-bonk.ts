/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { canUseBombs } from './can-use-bombs';
import type { CollectionState } from '../collection-state.type';

const canBombOrBonk = (state: CollectionState): boolean =>
  state.has(ITEM.pegasusBoots) || canUseBombs(state);

export { canBombOrBonk };
