/* @layer renderer-lib @kind logic */
import type { PoolAccounting } from '@rotp/randomizer';
import type { PoolFillTotals } from '@domains/app/compounds/PoolFillBar';

const poolTotalsOf = (accounting: PoolAccounting): PoolFillTotals => {
  const {
    items, fixed, filler, upgrades, prizes,
  } = accounting;
  return {
    items: Math.max(0, items - upgrades - filler),
    upgrades,
    filler,
    fixed,
    prizes,
  };
};

export { poolTotalsOf };
