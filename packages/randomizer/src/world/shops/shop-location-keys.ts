/* @layer shared-game @kind logic */
import { shopLocationKey } from '../location-key';
import { SHOP_SLOT_KEY_ROWS } from './shop-slot-key-rows.constants';
import { SIDE_OF_POSITION } from './shop-location-keys.constants';
import { shopSlugOf } from './shop-slug-of';
import type { ShopLocationKey } from '../location-key';
import type { ShopSlotFacts, ShopSlotKeyRow } from './shop-slot.type';

const keyRowOf = (slot: ShopSlotFacts): ShopSlotKeyRow => {
  const keyRow = SHOP_SLOT_KEY_ROWS[slot.canonicalIndex];
  if (keyRow === undefined) throw new Error(`shop slot ${slot.canonicalIndex} has no key row`);
  if (keyRow.shop !== shopSlugOf(slot.shopName) || keyRow.side !== SIDE_OF_POSITION[slot.position]) {
    throw new Error(`shop slot ${slot.canonicalIndex} key row disagrees with ${slot.checkId}`);
  }
  return keyRow;
};

const shopSlotLocationKey = (slot: ShopSlotFacts, depthIndex: number): ShopLocationKey => {
  const { shop, side } = keyRowOf(slot);
  return shopLocationKey(shop, side, depthIndex + 1);
};

export { shopSlotLocationKey };
