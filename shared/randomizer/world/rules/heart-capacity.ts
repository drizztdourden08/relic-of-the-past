/* @layer shared-game @kind logic */
/**
 * How many hearts a file can hold: the three it starts with, every container, and a heart per
 * four pieces. No cap is applied, because a heart price is paid out of what the file really
 * holds (rules/shop-prices.ts).
 */
import { ITEM } from '../item-ids.data';
import type { CollectionState } from '../collection-state';

/** Hearts a new file starts with, before any container or piece is collected. */
const STARTING_HEARTS = 3;
const PIECES_PER_HEART = 4;

const heartCapacity = (state: CollectionState): number =>
  STARTING_HEARTS
  + state.count(ITEM.bossHeartContainer)
  + state.count(ITEM.sanctuaryHeartContainer)
  + Math.floor(state.count(ITEM.pieceOfHeart) / PIECES_PER_HEART);

export { heartCapacity };
