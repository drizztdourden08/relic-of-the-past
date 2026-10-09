/* @layer shared-game @kind logic */
import { isDemandableItem } from '../pond-demand-eligibility';
import { DEMAND_ITEM_RANK } from '../pond-demand-order.data';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids.data';

const rankOf = (item: ItemKey): number => DEMAND_ITEM_RANK.get(item as ItemId) ?? DEMAND_ITEM_RANK.size;

const demandCandidatesOf = (itemPool: readonly ItemKey[]): readonly ItemKey[] =>
  [...new Set(itemPool.filter(isDemandableItem))].sort((left, right) => {
    const byRank = rankOf(left) - rankOf(right);
    return byRank !== 0 ? byRank : left.localeCompare(right);
  });

export { demandCandidatesOf };
