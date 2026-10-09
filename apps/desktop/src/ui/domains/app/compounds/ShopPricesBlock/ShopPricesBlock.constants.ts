/* @layer renderer-components @kind constants */
import {
  currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf,
} from '@shared/randomizer/world/shops/shop-price-options.data';
import type { CurrencyCatalogKeys } from '../CurrencyPriceRow';

const SHOP_CURRENCY_KEYS: CurrencyCatalogKeys = {
  keyOf: currencyKeyOf, minKeyOf: currencyMinKeyOf, maxKeyOf: currencyMaxKeyOf,
};

export { SHOP_CURRENCY_KEYS };
