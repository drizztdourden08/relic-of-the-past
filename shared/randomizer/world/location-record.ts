/* @layer shared-game @kind logic */
/**
 * The crossing between a location key and the check record that stands for it.
 *
 * Most locations ARE their record's id. A shelf's first stock is the exception with a record:
 * its key names the shop and shelf (location-key.ts), and its record keeps the dataset's own
 * id, which is what detection, the tracker's rows and the display name read. A restock, a pond
 * rung and the capacity shop's event have no record at all.
 */
import { isSlotKey } from './location-key';
import { shopLocationOfCheck, shopSlotLocationOf } from './shops/shop-slots';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from './location-key';

/** The check record a location stands for, or undefined when it has none. */
const checkIdOfLocation = (key: string): CheckId | undefined => {
  const shop = shopSlotLocationOf(key);
  if (shop !== undefined) return shop.depthIndex === 0 ? shop.slot.checkId : undefined;
  return isSlotKey(key) ? undefined : key as CheckId;
};

/** The location a check record stands for: its own id, or a shelf's first-stock key. */
const locationKeyOfCheck = (checkId: string): LocationKey =>
  shopLocationOfCheck(checkId) ?? checkId as CheckId;

export { checkIdOfLocation, locationKeyOfCheck };
