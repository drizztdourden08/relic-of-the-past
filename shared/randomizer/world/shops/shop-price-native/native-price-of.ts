/* @layer shared-game @kind logic */
import { NATIVE_BOTTLE_CONTENT, NATIVE_CURRENCY } from './shop-price-native.constants';
import type { NativePrice, ShopPrice } from '../shop-price.type';

const nativePriceOf = (price: ShopPrice): NativePrice | null => {
  if (price.currency === 'item') return null;
  if (price.currency === 'bottle') {
    return { currency: NATIVE_CURRENCY.bottle, amount: NATIVE_BOTTLE_CONTENT[price.content] };
  }
  return { currency: NATIVE_CURRENCY[price.currency], amount: price.amount };
};

export { nativePriceOf };
