/* @layer renderer-hooks @kind constants */
import type {
  ShopBottleContent, ShopCountedCurrency,
} from '@shared/randomizer/world/shops/shop-price.type';

const CURRENCY_SPRITE_FILES: Readonly<Record<ShopCountedCurrency, string>> = {
  rupees: 'currency-rupee',
  arrows: 'currency-arrow',
  bombs: 'currency-bomb',
  hearts: 'currency-heart',
};

const BOTTLE_SPRITE_FILES: Readonly<Record<ShopBottleContent, string>> = {
  fairy: 'currency-fairy',
  bee: 'currency-bee',
  'red-potion': 'currency-red-potion',
  'blue-potion': 'currency-blue-potion',
  'green-potion': 'currency-green-potion',
};

export { BOTTLE_SPRITE_FILES, CURRENCY_SPRITE_FILES };
