/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { itemKeyName } from '../../display-names/item-key-name';
import { ITEM } from '../../item-ids';
import {
  BOTTLE_KEY, CURRENCY_ROWS, ROLLED_BY_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
} from './shop-price-rows.constants';
import { bottleContentKeyOf } from './bottle-content-key-of';
import { currencyKeyOf } from './currency-key-of';
import { currencyMaxKeyOf } from './currency-max-key-of';
import { currencyMinKeyOf } from './currency-min-key-of';
import { shopPriceRangeSeed } from './shop-price-range-seed';
import { shopToggleSeed } from '../shop-toggle-seed';
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
  ...CURRENCY_ROWS.flatMap(({ currency, max, defaultMin, defaultMax }) => [
    shopToggleSeed(currencyKeyOf(currency), msg('randomizer-world:tpl.shop.price', { currency }), ROLLED_BY_DEFAULT),
    shopPriceRangeSeed(currencyMinKeyOf(currency), msg('randomizer-world:tpl.shop.min', { currency }), max, defaultMin),
    shopPriceRangeSeed(currencyMaxKeyOf(currency), msg('randomizer-world:tpl.shop.max', { currency }), max, defaultMax),
  ]),
  shopToggleSeed(BOTTLE_KEY, msg('randomizer-world:tpl.shop.bottle'), ROLLED_BY_DEFAULT),
  ...BOTTLE_CONTENTS.map(({ content }) =>
    shopToggleSeed(bottleContentKeyOf(content), msg('randomizer-world:tpl.shop.content', { content }), true)),
];

const SHOP_PRICE_OPTION_KEYS: readonly string[] = SHOP_PRICE_OPTION_SEEDS.map((seed) => seed.key);

const SHOP_PRICE_BLOCK_KEYS: readonly string[] = [...SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_MODIFIER_KEY];

export { BOTTLE_CONTENTS, SHOP_PRICE_BLOCK_KEYS, SHOP_PRICE_OPTION_KEYS, SHOP_PRICE_OPTION_SEEDS };
