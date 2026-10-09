/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { hasSword } from './has-sword';
import type { CollectionState } from '../collection-state.type';

const canMeltThings = (state: CollectionState): boolean =>
  state.has(ITEM.fireRod) || (state.has(ITEM.bombos) && hasSword(state));

export { canMeltThings };
