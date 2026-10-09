/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { hasSword } from './has-sword';
import type { CollectionState } from '../collection-state.type';

const hasMeleeWeapon = (state: CollectionState): boolean =>
  hasSword(state) || state.has(ITEM.hammer);

export { hasMeleeWeapon };
