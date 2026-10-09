/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import { standardNameOfCheck } from '@rotp/game-data';
import { isSlotKey } from '../../location-key';
import { shopSlotLocationOf } from '../../shops/shop-slots';
import { POND_LABEL_BY_ID, POND_RUNG, RESTOCK_ORDINALS } from './location-display-name.constants';
import type { LocationKey } from '../../location-key';

const slotName = (key: LocationKey): string => {
  const rung = POND_RUNG.exec(key);
  if (rung !== null) {
    const label = POND_LABEL_BY_ID.get(rung[1]);
    if (label !== undefined) return `${label} ${rung[2]}`;
  }
  return key;
};

const shopName = (key: LocationKey): string | undefined => {
  const purchase = shopSlotLocationOf(key);
  if (purchase === undefined) return undefined;
  const shelf = standardNameOfCheck(getCheck(purchase.slot.checkId));
  const ordinal = RESTOCK_ORDINALS[purchase.depthIndex - 1];
  return ordinal === undefined ? shelf : `${shelf} (${ordinal})`;
};

const locationDisplayName = (key: LocationKey): string =>
  shopName(key) ?? (isSlotKey(key) ? slotName(key) : standardNameOfCheck(getCheck(key)));

export { locationDisplayName };
