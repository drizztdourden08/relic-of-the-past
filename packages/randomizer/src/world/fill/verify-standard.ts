/* @layer shared-game @kind logic */
import { UNCLE_LOCATION, UNCLE_USABLE_WEAPONS } from '../pool/standard-escape';
import { uncleWeaponUsableAtStart } from '../pool/uncle-usability';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const verifyStandardEscape = (
  locations: Readonly<Record<LocationKey, ItemKey>>, capacity?: CapacityProfile, retroShotsBought = false,
): string[] => {
  const placed = locations[UNCLE_LOCATION];
  if (placed === undefined) {
    return [`standard mode requires a placement at ${UNCLE_LOCATION}, found none`];
  }
  if (!UNCLE_USABLE_WEAPONS.has(placed as ItemId)) {
    return [`standard mode requires a usable weapon at ${UNCLE_LOCATION}, found: ${placed}`];
  }
  if (capacity !== undefined && !uncleWeaponUsableAtStart(capacity, retroShotsBought)(placed)) {
    return [`standard mode requires a weapon usable at the starting rungs at ${UNCLE_LOCATION}, found: ${placed}`];
  }
  return [];
};

export { verifyStandardEscape };
