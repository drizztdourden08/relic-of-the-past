/* @layer shared-game @kind constants */
import { DEMAND_ITEM_ORDER } from './pond-demand-order.data';
import type { ItemId } from '@shared/game/data/types/ids';

const DEMAND_ITEM_RANK: ReadonlyMap<ItemId, number> = new Map(
  DEMAND_ITEM_ORDER.map((item, index) => [item, index]),
);

export { DEMAND_ITEM_RANK };
