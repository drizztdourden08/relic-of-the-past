/* @layer shared-game @kind logic */
import { ALL_SHOP_SLOT_LOCATIONS } from './shop-slot-maps.constants';
import type { LocationKey } from '../../location-key';
import type { ShopSlotLocation } from '../shop-slot.type';

const shopSlotLocationOf = (key: string): ShopSlotLocation | undefined =>
  ALL_SHOP_SLOT_LOCATIONS.get(key as LocationKey);

export { shopSlotLocationOf };
