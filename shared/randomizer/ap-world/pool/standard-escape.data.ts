/* @layer shared-game @kind data */
/**
 * Standard-mode escape assurance tables, transcribed from
 * Archipelago worlds/alttp/ItemPool.py generate_itempool 294-317: with no
 * starting melee weapon (the baseline has no precollected items), the
 * mentor check must hold a weapon the escape can be fought with. The scan
 * lists mirror the source exactly: one sword tier (first found), one bow
 * (first found), each named arsenal item once, and the bomb pack (bombless
 * start is off, so the upgrade branch at 315-317 never applies). The
 * escape-assist block (320-328) is off under default enemy health.
 */

const UNCLE_LOCATION = 'Link\'s Uncle';

/** ItemPool.py 302: sword tiers; only the first one found in the pool enters. */
const UNCLE_SWORD_CANDIDATES: readonly string[] = [
  'Progressive Sword', 'Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword',
];

/** ItemPool.py 306: bows; only the first one found in the pool enters. */
const UNCLE_BOW_CANDIDATES: readonly string[] = ['Progressive Bow', 'Bow'];

/** ItemPool.py 309: each enters once if present in the pool. */
const UNCLE_ARSENAL_CANDIDATES: readonly string[] = [
  'Hammer', 'Fire Rod', 'Cane of Somaria', 'Cane of Byrna',
];

/** ItemPool.py 312-313: the bombless-start toggle is off in the baseline. */
const UNCLE_BOMB_CANDIDATE = 'Bombs (10)';

/**
 * Every item the assurance may place: the acceptance set a stored standard
 * placement is verified against (verify-standard.ts).
 */
const UNCLE_USABLE_WEAPONS: ReadonlySet<string> = new Set([
  ...UNCLE_SWORD_CANDIDATES,
  ...UNCLE_BOW_CANDIDATES,
  ...UNCLE_ARSENAL_CANDIDATES,
  UNCLE_BOMB_CANDIDATE,
]);

export {
  UNCLE_LOCATION,
  UNCLE_SWORD_CANDIDATES,
  UNCLE_BOW_CANDIDATES,
  UNCLE_ARSENAL_CANDIDATES,
  UNCLE_BOMB_CANDIDATE,
  UNCLE_USABLE_WEAPONS,
};
