/* @layer shared-game @kind logic */
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from '../standard-escape';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids';
import type { WeaponFilter } from '../pool.type';
import type { CandidateScan } from './uncle-weapon.type';

const everyWeapon: WeaponFilter = () => true;

const takeCandidate = (item: ItemKey, scan: CandidateScan): void => {
  const { candidates } = scan;
  if (UNCLE_SWORD_CANDIDATES.includes(item as ItemId)) {
    if (!scan.foundSword) {
      scan.foundSword = true;
      candidates.push(item);
    }
  } else if (UNCLE_BOW_CANDIDATES.includes(item as ItemId) && !scan.foundBow) {
    scan.foundBow = true;
    candidates.push(item);
  } else if (UNCLE_ARSENAL_CANDIDATES.includes(item as ItemId)) {
    if (!candidates.includes(item)) candidates.push(item);
  } else if (item === UNCLE_BOMB_CANDIDATE && !candidates.includes(item)) {
    candidates.push(item);
  }
};

const uncleWeaponCandidates = (pool: readonly ItemKey[], isUsable: WeaponFilter = everyWeapon): ItemKey[] => {
  const scan: CandidateScan = { candidates: [], foundSword: false, foundBow: false };
  for (const item of pool) {
    if (isUsable(item)) takeCandidate(item, scan);
  }
  return scan.candidates;
};

export { uncleWeaponCandidates };
