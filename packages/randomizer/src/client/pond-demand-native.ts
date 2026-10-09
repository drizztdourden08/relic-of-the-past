/* @layer bridge-wasm @kind logic */
import { nativePriceOf } from '../world/shops/shop-price-native';
import { NO_DEMAND, POND_DEMAND_KIND } from './pond-demand-native.constants';
import type { ShopPrice } from '../world/shops/shop-price.type';
import type { NativeDemand } from './pond-demand-native.type';

const nativeDemandOf = (
  demand: ShopPrice | undefined, receiveIdOf: (item: string) => number | undefined,
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

export { nativeDemandOf };
export type { NativeDemand } from './pond-demand-native.type';
