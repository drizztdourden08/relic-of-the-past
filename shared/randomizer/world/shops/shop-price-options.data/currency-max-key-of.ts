/* @layer shared-game @kind logic */
import type { ShopCountedCurrency } from '../shop-price.type';

const currencyMaxKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}_max`;

export { currencyMaxKeyOf };
