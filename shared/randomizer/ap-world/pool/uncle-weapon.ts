/* @layer shared-game @kind logic */
/**
 * The standard-mode starting-weapon assurance: the port of
 * Archipelago worlds/alttp/ItemPool.py generate_itempool 294-318 for the
 * fixed baseline (no precollected melee weapon, bombless start off). The
 * candidate list is built by one pass over the assembled pool in pool
 * order, exactly as the source scans it: the first sword tier found, the
 * first bow found, each arsenal item once, the bomb pack once. The chosen
 * weapon leaves the pool and the caller locks it onto the mentor check.
 * Skipped entirely when that check is already pre-placed (the source's
 * placed_items guard, line 295. Here the location is scope-locked to its
 * vanilla sword). A usability filter (uncle-usability.ts) drops the
 * candidates a capacity profile makes useless at the start.
 */
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from './standard-escape.data';

type WeaponPicker = (choices: readonly string[]) => string;
type WeaponFilter = (itemName: string) => boolean;

const everyWeapon: WeaponFilter = () => true;

/** ItemPool.py 296-313: the possible_weapons scan, in pool order, over the usable candidates. */
const uncleWeaponCandidates = (pool: readonly string[], isUsable: WeaponFilter = everyWeapon): string[] => {
  const candidates: string[] = [];
  let foundSword = false;
  let foundBow = false;
  for (const item of pool) {
    if (!isUsable(item)) continue;
    if (UNCLE_SWORD_CANDIDATES.includes(item)) {
      if (!foundSword) {
        foundSword = true;
        candidates.push(item);
      }
    } else if (UNCLE_BOW_CANDIDATES.includes(item) && !foundBow) {
      foundBow = true;
      candidates.push(item);
    } else if (UNCLE_ARSENAL_CANDIDATES.includes(item)) {
      if (!candidates.includes(item)) candidates.push(item);
    } else if (item === UNCLE_BOMB_CANDIDATE && !candidates.includes(item)) {
      candidates.push(item);
    }
  }
  return candidates;
};

/** Pick the starting weapon and remove it from the pool (in place). */
const takeUncleWeapon = (pool: string[], pick: WeaponPicker, isUsable: WeaponFilter = everyWeapon): string => {
  const candidates = uncleWeaponCandidates(pool, isUsable);
  if (candidates.length === 0) throw new Error('no starting-weapon candidate in the pool');
  const weapon = pick(candidates);
  const index = pool.indexOf(weapon);
  if (index === -1) throw new Error(`picked starting weapon is not in the pool: ${weapon}`);
  pool.splice(index, 1);
  return weapon;
};

export { takeUncleWeapon, uncleWeaponCandidates };
export type { WeaponFilter, WeaponPicker };
