/* @layer shared-game @kind logic */
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from '../standard-escape';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids';
import type { WeaponFilter } from '../pool.type';

const everyWeapon: WeaponFilter = () => true;

const uncleWeaponCandidates = (pool: readonly ItemKey[], isUsable: WeaponFilter = everyWeapon): ItemKey[] => {
  const candidates: ItemKey[] = [];
  let foundSword = false;
  let foundBow = false;
  for (const item of pool) {
    if (!isUsable(item)) continue;
    if (UNCLE_SWORD_CANDIDATES.includes(item as ItemId)) {
      if (!foundSword) {
        foundSword = true;
        candidates.push(item);
      }
    } else if (UNCLE_BOW_CANDIDATES.includes(item as ItemId) && !foundBow) {
      foundBow = true;
      candidates.push(item);
    } else if (UNCLE_ARSENAL_CANDIDATES.includes(item as ItemId)) {
      if (!candidates.includes(item)) candidates.push(item);
    } else if (item === UNCLE_BOMB_CANDIDATE && !candidates.includes(item)) {
      candidates.push(item);
    }
  }
  return candidates;
};

export { uncleWeaponCandidates };
