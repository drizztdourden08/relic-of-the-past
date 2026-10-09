/* @layer renderer-hooks @kind logic */
import { spriteUrlOf } from '@rotp/game-data';
import type { ShopCountedCurrency } from '@shared/randomizer/world/shops/shop-price.type';
import { CURRENCY_SPRITE_FILES } from './currency-sprites.constants';

const currencySpriteOf = (currency: ShopCountedCurrency): string =>
  spriteUrlOf(CURRENCY_SPRITE_FILES[currency]);

export { currencySpriteOf };
