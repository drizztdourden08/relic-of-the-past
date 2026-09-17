/* @layer bridge-wasm @kind logic */
/**
 * A rung's rolled demand in the terms the core stores it, at any of the
 * three ponds (core/game-hooks/pond_demands.h): a kind tag, an amount and one
 * native id. The kinds are the shelf's currency tags plus one, so zero is "no
 * demand", and item is the one kind a shelf has no tag for.
 *
 *   counted:  the amount, straight through (hearts in WHOLE hearts);
 *   bottle:   the value the game stores in a bottle slot for that content,
 *             with how many bottles of it as the amount. A placement frozen
 *             before the count existed carries none, and meant one;
 *   item:     the receive id of the named item, resolved the way a grant of
 *             that name is, so a progressive family name carries its virtual
 *             id and the core reads the tier from live inventory.
 *
 * Pure: the item lookup is handed in, so a test pins it with a plain map.
 */

import { nativePriceOf } from '@shared/randomizer/ap-world/shops/shop-price-native';
import type { ShopPrice } from '@shared/randomizer/ap-world/shops/shop-price.type';

/** Tags shared with core/game-hooks/pond_demands.h. */
const POND_DEMAND_KIND = {
  none: 0,
  rupees: 1,
  arrows: 2,
  bombs: 3,
  hearts: 4,
  bottle: 5,
  item: 6,
} as const;

/** One rung's demand as the core reads it. */
interface NativeDemand {
  kind: number;
  amount: number;
  /** The bottle-slot value, or the item's receive id; 0 for a counted demand. */
  nativeId: number;
}

const NO_DEMAND: NativeDemand = { kind: POND_DEMAND_KIND.none, amount: 0, nativeId: 0 };

/**
 * The native form of one demand, NO_DEMAND when the rung rolled none, or the
 * reason it cannot be armed: an item name with no receive id would arm a
 * demand the core could never test, and a demand armed as none would hand the
 * rung over for free once the handler charges it.
 */
const nativeDemandOf = (
  demand: ShopPrice | undefined, receiveIdOf: (itemName: string) => number | undefined,
): NativeDemand | string => {
  if (demand === undefined) return NO_DEMAND;
  if (demand.currency === 'item') {
    const nativeId = receiveIdOf(demand.itemName);
    if (nativeId === undefined) return `its demand names "${demand.itemName}", which has no receive id`;
    return { kind: POND_DEMAND_KIND.item, amount: 0, nativeId };
  }
  const price = nativePriceOf(demand);
  if (price === null) return NO_DEMAND;
  const kind = price.currency + 1;
  return demand.currency === 'bottle'
    ? { kind, amount: demand.amount ?? 1, nativeId: price.amount }
    : { kind, amount: price.amount, nativeId: 0 };
};

export { NO_DEMAND, POND_DEMAND_KIND, nativeDemandOf };
export type { NativeDemand };
