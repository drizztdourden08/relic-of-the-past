/* @layer shared-game @kind logic */
import { uncleWeaponCandidates } from './uncle-weapon-candidates';
import type { ItemKey } from '../../item-ids.data';
import type { WeaponFilter, WeaponPicker } from '../pool.type';

const takeUncleWeapon = (pool: ItemKey[], pick: WeaponPicker, isUsable?: WeaponFilter): ItemKey => {
  const candidates = uncleWeaponCandidates(pool, isUsable);
  if (candidates.length === 0) throw new Error('no starting-weapon candidate in the pool');
  const weapon = pick(candidates);
  const index = pool.indexOf(weapon);
  if (index === -1) throw new Error(`picked starting weapon is not in the pool: ${weapon}`);
  pool.splice(index, 1);
  return weapon;
};

export { takeUncleWeapon };
