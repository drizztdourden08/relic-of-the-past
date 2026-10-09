/* @layer shared-game @kind constants */
import { CANONICAL_SLOTS } from '../shop-slot-facts';
import { shopSlotLocationKey } from '../shop-location-keys';
import { MAX_SHOP_SLOT_DEPTH } from './shop-slots.constants';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey } from '../../location-key';
import type { ShopSlotLocation } from '../shop-slot.type';

const ALL_SHOP_SLOT_LOCATIONS: ReadonlyMap<LocationKey, ShopSlotLocation> = new Map(
  CANONICAL_SLOTS.flatMap((slot) =>
    Array.from({ length: MAX_SHOP_SLOT_DEPTH }, (_unused, depthIndex): [LocationKey, ShopSlotLocation] => [
      shopSlotLocationKey(slot, depthIndex),
      { slot, key: shopSlotLocationKey(slot, depthIndex), depthIndex },
    ])),
);

const FIRST_STOCK_BY_CHECK: ReadonlyMap<string, LocationKey> = new Map(
  CANONICAL_SLOTS.map((slot): [CheckId, LocationKey] => [slot.checkId, shopSlotLocationKey(slot, 0)]),
);

export { ALL_SHOP_SLOT_LOCATIONS, FIRST_STOCK_BY_CHECK };
