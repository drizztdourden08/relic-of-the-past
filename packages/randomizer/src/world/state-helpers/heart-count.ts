/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { BASELINE, HEART_PIECES_PER_HEART } from './state-helpers.constants';
import type { CollectionState } from '../collection-state.type';

const heartCount = (state: CollectionState): number =>
  Math.min(state.count(ITEM.bossHeartContainer), BASELINE.logicalHeartContainers)
  + state.count(ITEM.sanctuaryHeartContainer)
  + Math.floor(Math.min(state.count(ITEM.pieceOfHeart), BASELINE.logicalHeartPieces) / HEART_PIECES_PER_HEART)
  + BASELINE.startingHearts;

export { heartCount };
