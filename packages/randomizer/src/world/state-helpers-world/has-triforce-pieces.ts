/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import type { CollectionState } from '../collection-state.type';

const hasTriforcePieces = (state: CollectionState, required = 0): boolean =>
  state.count(ITEM.triforcePiece) + state.count(ITEM.powerStar) >= required;

export { hasTriforcePieces };
