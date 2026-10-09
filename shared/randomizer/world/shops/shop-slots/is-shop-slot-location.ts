/* @layer shared-game @kind logic */
import { ALL_SHOP_SLOT_LOCATIONS } from './shop-slot-maps.constants';
import type { LocationKey } from '../../location-key';

const isShopSlotLocation = (key: string): boolean => ALL_SHOP_SLOT_LOCATIONS.has(key as LocationKey);

export { isShopSlotLocation };
