/* @layer shared-game @kind logic */
import { SHOP_SCOPE_OPTION_KEYS } from './shop-slot-options.constants';

const isShopScopeOptionKey = (key: string): boolean => SHOP_SCOPE_OPTION_KEYS.includes(key);

export { isShopScopeOptionKey };
