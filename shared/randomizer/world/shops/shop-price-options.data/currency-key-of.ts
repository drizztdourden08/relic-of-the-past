/* @layer shared-game @kind logic */
import type { ShopCountedCurrency } from '../shop-price.type';

const currencyKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}`;

export { currencyKeyOf };
