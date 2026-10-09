/* @layer shared-game @kind logic */
import { familyById } from '../capacity/capacity-family';
import { startTierOf } from '../capacity/family-plan';
import { UNCLE_BOW_CANDIDATES } from './standard-escape.data';
import { START_FAMILY_OF_WEAPON } from './uncle-usability.constants';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const uncleWeaponUsableAtStart = (
  profile: CapacityProfile, retroShotsBought = false,
) => (item: ItemKey): boolean => {
  if (retroShotsBought && UNCLE_BOW_CANDIDATES.includes(item as ItemId)) return false;
  const family = START_FAMILY_OF_WEAPON.get(item);
  return family === undefined || startTierOf(familyById(family), profile[family]) > 0;
};

export { uncleWeaponUsableAtStart };
