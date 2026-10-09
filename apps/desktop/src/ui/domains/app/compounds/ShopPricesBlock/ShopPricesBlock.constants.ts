/* @layer renderer-components @kind constants */
import { currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf } from '@rotp/randomizer';
import type { CurrencyCatalogKeys } from '../CurrencyPriceRow';

const SHOP_CURRENCY_KEYS: CurrencyCatalogKeys = {
  keyOf: currencyKeyOf, minKeyOf: currencyMinKeyOf, maxKeyOf: currencyMaxKeyOf,
};

export { SHOP_CURRENCY_KEYS };
