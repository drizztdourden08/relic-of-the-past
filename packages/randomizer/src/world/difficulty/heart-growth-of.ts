/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { PIECES_PER_HEART } from './difficulty.data';
import { countInPool } from './count-in-pool';
import type { ItemKey } from '../item-ids.data';

const heartGrowthOf = (pool: readonly ItemKey[]): number =>
  countInPool(pool, ITEM.bossHeartContainer)
  + countInPool(pool, ITEM.sanctuaryHeartContainer)
  + Math.floor(countInPool(pool, ITEM.pieceOfHeart) / PIECES_PER_HEART);

export { heartGrowthOf };
