/* @layer shared-game @kind constants */
import type { ShopBottleContent } from '../shop-price.type';

const NATIVE_CURRENCY = {
  rupees: 0,
  arrows: 1,
  bombs: 2,
  hearts: 3,
  bottle: 4,
} as const;

const NATIVE_BOTTLE_CONTENT: Readonly<Record<ShopBottleContent, number>> = {
  'red-potion': 3,
  'green-potion': 4,
  'blue-potion': 5,
  fairy: 6,
  bee: 7,
};

export { NATIVE_BOTTLE_CONTENT, NATIVE_CURRENCY };
