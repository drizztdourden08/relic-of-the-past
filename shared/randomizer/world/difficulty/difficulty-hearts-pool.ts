/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import type { ItemKey } from '../item-ids.data';
import { REPLACEMENT_ITEM } from '../progressive/progressive-families.data';
import { PIECES_PER_HEART, STARTING_HEARTS, asHeartCap } from './difficulty.data';
import { countInPool } from './count-in-pool';
import { heartGrowthOf } from './heart-growth-of';

const convertLast = (pool: ItemKey[], wanted: ItemKey): boolean => {
  const index = pool.lastIndexOf(wanted);
  if (index === -1) return false;
  pool[index] = REPLACEMENT_ITEM;
  return true;
};

const convertPieceSet = (pool: ItemKey[]): boolean => {
  if (countInPool(pool, ITEM.pieceOfHeart) < PIECES_PER_HEART) return false;
  for (let piece = 0; piece < PIECES_PER_HEART; piece += 1) convertLast(pool, ITEM.pieceOfHeart);
  return true;
};

const applyHeartCap = (pool: ItemKey[], cap: number): number => {
  let excess = heartGrowthOf(pool) - (asHeartCap(cap) - STARTING_HEARTS);
  let removed = 0;
  while (excess > 0 && convertPieceSet(pool)) { excess -= 1; removed += 1; }
  while (excess > 0 && convertLast(pool, ITEM.bossHeartContainer)) { excess -= 1; removed += 1; }
  while (excess > 0 && convertLast(pool, ITEM.sanctuaryHeartContainer)) { excess -= 1; removed += 1; }
  return removed;
};

export { applyHeartCap };
