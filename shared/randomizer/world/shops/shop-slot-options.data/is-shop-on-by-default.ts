/* @layer shared-game @kind logic */
import { DEFAULT_OFF_SHOPS } from './shop-slot-options.data';
import type { ShopSlotFacts } from '../shop-slot.type';

const isShopOnByDefault = (slot: ShopSlotFacts): boolean => !DEFAULT_OFF_SHOPS.includes(slot.shopId);

export { isShopOnByDefault };
