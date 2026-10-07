/* @layer renderer-hooks @kind logic */
/**
 * The extracted PNG that stands for one currency a price may be asked in. The
 * files are the shop block's own symbols (sprite-manifest/randomizer-sprites.ts),
 * read through the same sprite query the tracker, the pool listing and the
 * check list already draw from, so every surface shows one set of art and
 * there is no second path to a sprite.
 *
 * A whole price resolves the same way: a counted currency to its symbol, a
 * bottle to the symbol of what is in it, and an item to its own drawing
 * (pool-item-sprite.ts), which is the one thing that says WHICH item without
 * spelling the name again.
 */
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import { poolItemSpriteOf } from './pool-item-sprite';
import type {
  ShopBottleContent, ShopCountedCurrency, ShopPrice,
} from '@shared/randomizer/ap-world/shops/shop-price.type';

const CURRENCY_SPRITE_FILES: Readonly<Record<ShopCountedCurrency, string>> = {
  rupees: 'currency-rupee',
  arrows: 'currency-arrow',
  bombs: 'currency-bomb',
  hearts: 'currency-heart',
};

/** What is in the bottle, drawn as the shop block draws it. */
const BOTTLE_SPRITE_FILES: Readonly<Record<ShopBottleContent, string>> = {
  fairy: 'currency-fairy',
  bee: 'currency-bee',
  'red-potion': 'currency-red-potion',
  'blue-potion': 'currency-blue-potion',
  'green-potion': 'currency-green-potion',
};

const currencySpriteOf = (currency: ShopCountedCurrency): string =>
  spriteUrlOf(CURRENCY_SPRITE_FILES[currency]);

/** The sprite one price is shown with; an item with no art at all has none. */
const priceSpriteOf = (price: ShopPrice): string | undefined => {
  if (price.currency === 'item') return poolItemSpriteOf(price.itemName);
  if (price.currency === 'bottle') return spriteUrlOf(BOTTLE_SPRITE_FILES[price.content]);
  return currencySpriteOf(price.currency);
};

export { BOTTLE_SPRITE_FILES, CURRENCY_SPRITE_FILES, currencySpriteOf, priceSpriteOf };
