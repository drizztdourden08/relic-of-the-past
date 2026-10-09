/* @layer shared-game @kind data */
import type { CurrencyRow } from '../shop-price.type';

const CURRENCY_ROWS: readonly CurrencyRow[] = [
  { currency: 'rupees', label: 'Rupees', max: 1000, defaultMin: 0, defaultMax: 1000 },
  { currency: 'arrows', label: 'Arrows', max: 10, defaultMin: 0, defaultMax: 10 },
  { currency: 'bombs', label: 'Bombs', max: 10, defaultMin: 0, defaultMax: 10 },
  { currency: 'hearts', label: 'Hearts', max: 10, defaultMin: 0, defaultMax: 10 },
];

const BOTTLE_KEY = 'shop_price_bottle';

const ROLLED_BY_DEFAULT = true;

const SHOP_PRICE_MODIFIER_KEY = 'shop_price_modifier';
const SHOP_PRICE_MODIFIER_MIN = 0;
const SHOP_PRICE_MODIFIER_MAX = 400;
const SHOP_PRICE_MODIFIER_DEFAULT = 100;

export {
  BOTTLE_KEY, CURRENCY_ROWS, ROLLED_BY_DEFAULT, SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
  SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
};
