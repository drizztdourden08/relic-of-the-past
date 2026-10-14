/* @layer shared-game @kind logic */
import { uncleWeaponUsableAtStart } from '../uncle-usability';
import { UNCLE_LOCATION } from '../standard-escape';
import { takeUncleWeapon } from '../uncle-weapon';
import type { ItemKey } from '../../item-ids';
import type { UncleInput } from './build-item-pool.type';

const takeUncleForPool = (pool: ItemKey[], input: UncleInput): ItemKey | undefined => {
  const { pickWeapon, lockedScope, capacity, retro } = input;
  if (pickWeapon === undefined || lockedScope.has(UNCLE_LOCATION)) return undefined;
  return takeUncleWeapon(pool, pickWeapon, uncleWeaponUsableAtStart(capacity, retro?.enabled === true));
};

export { takeUncleForPool };
