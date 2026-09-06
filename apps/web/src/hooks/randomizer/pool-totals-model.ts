/* @layer renderer-lib @kind logic */
/**
 * The pool accounting split for the fill bar: the items of the pool minus
 * the capacity upgrades and the filler are the items in pool, the upgrades
 * and the filler stand on their own, the fixed spots and the spots pass
 * through. Every input is the accounting's own number; this only takes the
 * two segments out of the pool count so the four fill the spots exactly.
 */
import type { PoolAccounting } from '@shared/randomizer/ap-world/pool/pool-accounting';
import type { PoolFillTotals } from '@domains/app/compounds/PoolFillBar';

const poolTotalsOf = (accounting: PoolAccounting): PoolFillTotals => {
  const { items, spots, fixed, filler, upgrades } = accounting;
  return {
    items: Math.max(0, items - upgrades - filler),
    upgrades,
    filler,
    fixed,
    spots,
  };
};

export { poolTotalsOf };
