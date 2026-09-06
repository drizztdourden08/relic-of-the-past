/* @layer shared-game @kind logic */
/**
 * The tier ticks applied to an assembled pool. Two things make this a pass over
 * the finished pool instead of a shorter row at the start.
 *
 * The pool keeps its transcribed SIZE whatever the ticks say: an unticked rung
 * leaves the reference's own stand-in behind (ItemPool.py 76, the swordless row
 * of four twenty-rupee pickups) instead of shrinking the row. That is what
 * keeps the fixed 153-item total (ItemPool.py total_items_to_place) true for
 * every tick set, so the fill still has exactly one item per open location and
 * nothing downstream has to learn a second arithmetic.
 *
 * And the ticks bite on WHAT THE SHUFFLE CARRIES, which is only known once the
 * locked-vanilla scope has been subtracted. A profile that leaves the character
 * and world checks out of the shuffle has already taken those locations' items
 * off the pool, and those locations go on handing them over in game whatever a
 * tick says, so a tick that tried to remove one of them would be removing a
 * copy that is not there, and the subtraction would fail. Running after it
 * means a tick only ever removes a copy that was really going to be shuffled.
 *
 * Copies are converted from the BACK, so the earliest survive. The standard-mode
 * starting-weapon scan reads the pool in order (uncle-weapon.ts), so a family
 * with any rung left still offers the assurance one; a family with none offers
 * nothing, which is the reference's swordless behaviour arrived at from the
 * ticks instead of from a second switch.
 */
import { PROGRESSIVE_FAMILIES, REPLACEMENT_ITEM } from './progressive-families.data';
import { tickedCountOf } from './progressive-reach';
import type { ProgressiveSetting } from './progressive.type';

/**
 * In place: one copy per unticked rung becomes the stand-in pickup, as far as
 * the shuffle carries copies to convert. Counting the UNTICKED rungs rather
 * than comparing against the ticked total is what makes a tick mean the same
 * thing under every scope: "one fewer of these in the seed", applied to what is
 * being shuffled. Comparing totals instead would silently do nothing whenever
 * the vanilla givers had already claimed as many copies as the ticks left.
 */
const applyProgressiveTicks = (pool: string[], setting: ProgressiveSetting): void => {
  for (const family of PROGRESSIVE_FAMILIES) {
    let remove = family.tiers.length - tickedCountOf(setting, family.id);
    while (remove > 0) {
      const index = pool.lastIndexOf(family.poolItem);
      if (index === -1) break;
      pool[index] = REPLACEMENT_ITEM;
      remove -= 1;
    }
  }
};

export { applyProgressiveTicks };
