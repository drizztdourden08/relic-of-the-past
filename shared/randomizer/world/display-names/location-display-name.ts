/* @layer shared-game @kind logic */
/**
 * What to CALL a location, read back off the records.
 *
 * The engine keys every location by id (location-key.ts), so this is the only place a name is
 * produced, and only for something that gets shown: a spoiler line, a receipt, a tracker row.
 * A check answers with its own standard name. A slot with no record of its own is named from
 * the row that owns it, which is how a shelf's second purchase reads as its shelf plus an
 * ordinal and a pond rung reads as its pond plus a number.
 */
import { getCheck } from '@shared/game/data';
import { standardNameOfCheck } from '@shared/game/data/check-standard-name';
import { isSlotKey } from '../location-key';
import { POND_INSTANCES } from '../pond/pond-instances';
import { shopSlotLocationOf } from '../shops/shop-slots';
import type { LocationKey } from '../location-key';

/** Depth ordinals past the first; the first purchase keeps the shelf's plain name. */
const RESTOCK_ORDINALS: readonly string[] = ['2nd', '3rd', '4th', '5th'];

const POND_LABEL_BY_ID: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.map((pond) => [pond.id, pond.label]),
);

const POND_RUNG = /^slot-pond-(.+)-(\d+)$/;

const slotName = (key: LocationKey): string => {
  const rung = POND_RUNG.exec(key);
  if (rung !== null) {
    const label = POND_LABEL_BY_ID.get(rung[1]);
    if (label !== undefined) return `${label} ${rung[2]}`;
  }
  return key;
};

/** A shelf purchase reads as its shelf's record, plus an ordinal past the first stock. */
const shopName = (key: LocationKey): string | undefined => {
  const purchase = shopSlotLocationOf(key);
  if (purchase === undefined) return undefined;
  const shelf = standardNameOfCheck(getCheck(purchase.slot.checkId));
  const ordinal = RESTOCK_ORDINALS[purchase.depthIndex - 1];
  return ordinal === undefined ? shelf : `${shelf} (${ordinal})`;
};

/** The name to show for one location. */
const locationDisplayName = (key: LocationKey): string =>
  shopName(key) ?? (isSlotKey(key) ? slotName(key) : standardNameOfCheck(getCheck(key)));

export { RESTOCK_ORDINALS, locationDisplayName };
