/* @layer shared-game @kind logic */
/**
 * A random-order family's copies turned into the rungs themselves.
 *
 * Runs AFTER the tick pass, on the finished pool, for the same two reasons
 * that pass does (progressive-pool.ts): the pool keeps its transcribed size,
 * because every conversion is one name swapped for one name; and the mode
 * bites on WHAT THE SHUFFLE CARRIES, which is only known once the locked
 * vanilla scope has been subtracted.
 *
 * Copies are named from the TOP of the ladder down. That is what keeps a
 * partly-locked family coherent: the copies a character check still hands over
 * are nameless steps and always resolve to the lowest rung not yet held, so
 * leaving the LOW rungs to them and putting the HIGH ones in the pool as
 * themselves means the two readings can never hand over the same rung twice.
 * With the whole family shuffled (every copy in the pool) that is
 * every rung, once each.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { isRandomOrder } from './progressive-modes.data';
import { tickedIndexesOf } from './progressive-reach';
import type { ProgressiveModeSetting, ProgressiveSetting } from './progressive.type';

/** Where every copy of one name sits, in pool order. */
const positionsOf = (pool: readonly string[], name: string): number[] => {
  const found: number[] = [];
  pool.forEach((item, index) => { if (item === name) found.push(index); });
  return found;
};

/**
 * In place: each remaining copy of a random-order family's pool item becomes
 * one of that family's ticked rungs, highest first. A family the shuffle
 * carries no copy of is left alone, since there is nothing to name.
 */
const applyProgressiveModes = (
  pool: string[], setting: ProgressiveSetting, modes: ProgressiveModeSetting,
): void => {
  for (const family of PROGRESSIVE_FAMILIES) {
    if (!isRandomOrder(modes, family.id)) continue;
    const copies = positionsOf(pool, family.poolItem);
    const rungs = [...tickedIndexesOf(setting, family.id)].reverse();
    copies.forEach((position, order) => {
      const rung = rungs[order];
      const name = rung === undefined ? undefined : family.tiers[rung];
      if (name !== undefined) pool[position] = name;
    });
  }
};

export { applyProgressiveModes };
