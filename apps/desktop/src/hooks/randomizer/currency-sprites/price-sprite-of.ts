/* @layer renderer-hooks @kind logic */
import { spriteUrlOf } from '@rotp/game-data';
import type { ShopPrice } from '@shared/randomizer/world/shops/shop-price.type';
import { poolItemSpriteOf } from '../pool-item-sprite';
import { BOTTLE_SPRITE_FILES } from './currency-sprites.constants';
import { currencySpriteOf } from './currency-sprite-of';

const priceSpriteOf = (price: ShopPrice): string | undefined => {
  if (price.currency === 'item') return poolItemSpriteOf(price.itemName);
  if (price.currency === 'bottle') return spriteUrlOf(BOTTLE_SPRITE_FILES[price.content]);
  return currencySpriteOf(price.currency);
};

export { priceSpriteOf };
