/* @layer shared-game @kind constants */
import { ITEM } from '../../world/item-ids';
import type { ShopBottleContent } from '../../world/shops/shop-price.type';
import type { PondDemandPlace } from './pond-demand-lines.type';

const BOTTLE_NAMES: Readonly<Record<ShopBottleContent, string>> = {
  'red-potion': ITEM.redPotion, 'green-potion': ITEM.greenPotion, 'blue-potion': ITEM.bluePotion, fairy: 'Fairy', bee: ITEM.bee,
};

const BOTTLE_PLURALS: Readonly<Record<ShopBottleContent, string>> = {
  'red-potion': ITEM.redPotion, 'green-potion': ITEM.greenPotion, 'blue-potion': ITEM.bluePotion,
  fairy: 'Fairies', bee: 'Bees',
};

const POTIONS: ReadonlySet<ShopBottleContent> = new Set(['red-potion', 'green-potion', 'blue-potion']);

const CLOSING: Readonly<Record<Exclude<PondDemandPlace, 'wish'>, string>> = {
  more: 'The water holds more.',
  last: 'The water is empty now.',
};

export { BOTTLE_NAMES, BOTTLE_PLURALS, CLOSING, POTIONS };
