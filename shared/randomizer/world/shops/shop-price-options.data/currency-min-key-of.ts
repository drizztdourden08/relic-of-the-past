/* @layer shared-game @kind logic */
import type { ShopCountedCurrency } from '../shop-price.type';

const currencyMinKeyOf = (currency: ShopCountedCurrency): string => `shop_price_${currency}_min`;

export { currencyMinKeyOf };
