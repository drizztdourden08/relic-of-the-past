/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { CollectionState } from '../collection-state.type';

const canBootsClipLw = (state: CollectionState): boolean => state.has(ITEM.pegasusBoots);

export { canBootsClipLw };
