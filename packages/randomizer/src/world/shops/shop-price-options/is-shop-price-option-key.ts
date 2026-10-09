/* @layer shared-game @kind logic */
import { SHOP_PRICE_BLOCK_KEYS } from './shop-price-options.constants';

const isShopPriceOptionKey = (key: string): boolean => SHOP_PRICE_BLOCK_KEYS.includes(key);

export { isShopPriceOptionKey };
