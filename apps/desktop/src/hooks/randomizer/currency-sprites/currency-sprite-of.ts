/* @layer renderer-hooks @kind logic */
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import type { ShopCountedCurrency } from '@shared/randomizer/world/shops/shop-price.type';
import { CURRENCY_SPRITE_FILES } from './currency-sprites.constants';

const currencySpriteOf = (currency: ShopCountedCurrency): string =>
  spriteUrlOf(CURRENCY_SPRITE_FILES[currency]);

export { currencySpriteOf };
