/* @layer shared-game @kind logic */
import { CANONICAL_SLOTS } from '../shop-slot-facts';
import { shopSlotLocationKey } from '../shop-location-keys';
import type { LocationKey } from '../../location-key';

const shopPurchaseKeyOfCheck = (checkId: string, purchase: number): LocationKey | undefined => {
  const slot = CANONICAL_SLOTS.find((row) => row.checkId === checkId);
  return slot === undefined ? undefined : shopSlotLocationKey(slot, purchase - 1);
};

export { shopPurchaseKeyOfCheck };
