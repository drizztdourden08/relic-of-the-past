/* @layer shared-game @kind logic */
import { SHOP_SHUFFLE_MODES } from './shop-scope.constants';
import type { ShopShuffleMode } from '../shop-scope.type';

const isShopShuffleMode = (value: unknown): value is ShopShuffleMode =>
  SHOP_SHUFFLE_MODES.includes(value as ShopShuffleMode);

export { isShopShuffleMode };
