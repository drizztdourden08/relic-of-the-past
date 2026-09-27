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
import { ITEM } from '../item-ids.data';
import type { CheckId, ItemId } from '@shared/game/data/types/ids';

/** The mentor's own check, the one spot the assurance places onto. */
const UNCLE_LOCATION: CheckId = 'check-017';

/** ItemPool.py 302: sword tiers; only the first one found in the pool enters. */
const UNCLE_SWORD_CANDIDATES: readonly ItemId[] = [
  ITEM.progressiveSword, ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword,
];

/** ItemPool.py 306: bows; only the first one found in the pool enters. */
const UNCLE_BOW_CANDIDATES: readonly ItemId[] = [ITEM.progressiveBow, ITEM.bow];

/** ItemPool.py 309: each enters once if present in the pool. */
const UNCLE_ARSENAL_CANDIDATES: readonly ItemId[] = [
  ITEM.hammer, ITEM.fireRod, ITEM.caneOfSomaria, ITEM.caneOfByrna,
];

/** ItemPool.py 312-313: the bombless-start toggle is off in the baseline. */
const UNCLE_BOMB_CANDIDATE: ItemId = ITEM.bombs10;

/**
 * Every item the assurance may place: the acceptance set a stored standard
 * placement is verified against (verify-standard.ts).
 */
const UNCLE_USABLE_WEAPONS: ReadonlySet<ItemId> = new Set<ItemId>([
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
