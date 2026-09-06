/* @layer shared-game @kind logic */
/**
 * The reference's toss / re-add loop (ItemPool.py 436-490) for the capacity
 * upgrades: every upgrade item past the spots that became checks displaces
 * one filler item, so the pool stays exactly one item per open location.
 * Filler is what the reference classifies as neither progression nor useful
 * and never an upgrade item itself, so a wallet item can never be trimmed to
 * make room for another. The pool is edited in place; a negative delta
 * (more open spots than items, impossible by construction, kept for the
 * reference's symmetry) re-adds the twenty-rupee filler.
 */
import { isCapacityUpgradeItemName } from '@shared/game/data/capacity-upgrade-item';
import { PROGRESSION_ITEMS, USEFUL_ITEMS } from './item-classes.data';

/** Picks which of `count` filler positions leaves the pool. */
type FillerPicker = (count: number) => number;

const REPLACEMENT_FILLER = 'Rupees (20)';

/** Deterministic default: the last filler in pool order goes. */
const lastFiller: FillerPicker = (count) => count - 1;

const isFillerItem = (name: string): boolean =>
  !PROGRESSION_ITEMS.has(name) && !USEFUL_ITEMS.has(name) && !isCapacityUpgradeItemName(name);

const balanceFiller = (pool: string[], delta: number, pickIndex: FillerPicker = lastFiller): void => {
  for (let n = 0; n < delta; n += 1) {
    const fillerAt = pool.flatMap((name, index) => (isFillerItem(name) ? [index] : []));
    if (fillerAt.length === 0) throw new Error('no filler left to trim for capacity upgrades');
    pool.splice(fillerAt[pickIndex(fillerAt.length)], 1);
  }
  for (let n = delta; n < 0; n += 1) pool.push(REPLACEMENT_FILLER);
};

/** How many filler items a pool can still give up. */
const fillerCountOf = (pool: readonly string[]): number => pool.filter(isFillerItem).length;

export { balanceFiller, fillerCountOf, isFillerItem };
export type { FillerPicker };
