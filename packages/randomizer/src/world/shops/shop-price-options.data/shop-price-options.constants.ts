/* @layer shared-game @kind constants */
import { itemKeyName } from '../../display-names/item-key-name';
import { ITEM } from '../../item-ids.data';
import {
  BOTTLE_KEY, CURRENCY_ROWS, ROLLED_BY_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
} from './shop-price-options.data';
import { bottleContentKeyOf } from './bottle-content-key-of';
import { currencyKeyOf } from './currency-key-of';
import { currencyMaxKeyOf } from './currency-max-key-of';
import { currencyMinKeyOf } from './currency-min-key-of';
import { shopPriceRangeSeed } from './shop-price-range-seed';
import { shopPriceToggleSeed } from './shop-price-toggle-seed';
import type { OptionSeed } from '../../options.type';
import type { BottleContentRow } from '../shop-price.type';

const BOTTLE_CONTENTS: readonly BottleContentRow[] = [
  { content: 'fairy', label: 'Fairy' },
  { content: 'bee', label: itemKeyName(ITEM.bee) },
  { content: 'red-potion', label: itemKeyName(ITEM.redPotion) },
  { content: 'blue-potion', label: itemKeyName(ITEM.bluePotion) },
  { content: 'green-potion', label: itemKeyName(ITEM.greenPotion) },
];

const SHOP_PRICE_OPTION_SEEDS: readonly OptionSeed[] = [
  ...CURRENCY_ROWS.flatMap(({ currency, label, max, defaultMin, defaultMax }) => [
    shopPriceToggleSeed(currencyKeyOf(currency), `${label} prices`, ROLLED_BY_DEFAULT),
    shopPriceRangeSeed(currencyMinKeyOf(currency), `${label} price minimum`, max, defaultMin),
    shopPriceRangeSeed(currencyMaxKeyOf(currency), `${label} price maximum`, max, defaultMax),
  ]),
  shopPriceToggleSeed(BOTTLE_KEY, 'Bottle prices', ROLLED_BY_DEFAULT),
  ...BOTTLE_CONTENTS.map(({ content, label }) =>
    shopPriceToggleSeed(bottleContentKeyOf(content), `${label} as a price`, true)),
];

const SHOP_PRICE_OPTION_KEYS: readonly string[] = SHOP_PRICE_OPTION_SEEDS.map((seed) => seed.key);

const SHOP_PRICE_BLOCK_KEYS: readonly string[] = [...SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_MODIFIER_KEY];

export { BOTTLE_CONTENTS, SHOP_PRICE_BLOCK_KEYS, SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_OPTION_SEEDS };
