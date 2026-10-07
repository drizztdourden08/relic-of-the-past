/* @layer shared-game @kind logic */
/**
 * The location key of one purchase from one canonical slot.
 *
 * The key table (shop-location-keys.data.ts) is written out by hand so a key is plain to read
 * and never moves with a record edit. It is still held to the rule that wrote it: the slug is
 * the shop's own name made into a slug, and the side is the record's shelf position. A row
 * that disagrees fails at load instead of naming a slot after the wrong shelf.
 */
import { shopLocationKey } from '../location-key';
import { SHOP_SLOT_KEY_ROWS } from './shop-location-keys.data';
import type { ShopSlotPosition } from '@shared/game/data';
import type { ShelfSide, ShopLocationKey } from '../location-key';
import type { ShopSlotFacts } from './shop-slot-facts';
import type { ShopSlotKeyRow } from './shop-location-keys.data';

/** A shop that sells from one spot has no neighbour to stand left or right of. */
const SIDE_OF_POSITION: Readonly<Record<ShopSlotPosition, ShelfSide>> = {
  Left: 'left', Center: 'center', Right: 'right', Single: 'center',
};

/** "Cave Shop (Lake Hylia)" -> `cave-shop-lake-hylia`. */
const shopSlugOf = (shopName: string): string =>
  shopName.toLowerCase().replace(/[()]/g, '').trim().split(/\s+/).join('-');

const keyRowOf = (slot: ShopSlotFacts): ShopSlotKeyRow => {
  const keyRow = SHOP_SLOT_KEY_ROWS[slot.canonicalIndex] as ShopSlotKeyRow | undefined;
  if (keyRow === undefined) throw new Error(`shop slot ${slot.canonicalIndex} has no key row`);
  if (keyRow.shop !== shopSlugOf(slot.shopName) || keyRow.side !== SIDE_OF_POSITION[slot.position]) {
    throw new Error(`shop slot ${slot.canonicalIndex} key row disagrees with ${slot.checkId}`);
  }
  return keyRow;
};

/** Purchase |depthIndex| (0 is the first stock) of one canonical slot. */
const shopSlotLocationKey = (slot: ShopSlotFacts, depthIndex: number): ShopLocationKey => {
  const { shop, side } = keyRowOf(slot);
  return shopLocationKey(shop, side, depthIndex + 1);
};

export { shopSlotLocationKey, shopSlugOf };
