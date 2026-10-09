/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { PIECES_PER_HEART, STARTING_HEARTS } from './heart-capacity.constants';
import type { CollectionState } from '../collection-state.type';

const heartCapacity = (state: CollectionState): number =>
  STARTING_HEARTS
  + state.count(ITEM.bossHeartContainer)
  + state.count(ITEM.sanctuaryHeartContainer)
  + Math.floor(state.count(ITEM.pieceOfHeart) / PIECES_PER_HEART);

export { heartCapacity };
