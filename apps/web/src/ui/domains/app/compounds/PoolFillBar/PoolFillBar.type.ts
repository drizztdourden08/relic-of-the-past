/* @layer renderer-components @kind types */

/**
 * The pool against the spots of the world, already reconciled: every number
 * is a count of items or spots, and the four item counts together never
 * exceed the spots, the bar's full width.
 */
interface PoolFillTotals {
  /** Items in the pool that are neither a capacity upgrade nor filler: progression, useful, dungeon items, prizes. */
  items: number;
  /** Capacity upgrade items in the pool, each in a filler's place. */
  upgrades: number;
  /** Balance filler still in the pool. */
  filler: number;
  /** Spots settled before the shuffle: a locked vanilla item, the assured starting weapon. */
  fixed: number;
  /** Every spot an item can sit in; the bar's full width, whatever stays bare has nothing. */
  spots: number;
}

interface PoolFillBarProps {
  /** Null when the pool could not be built; `error` then says why. */
  totals: PoolFillTotals | null;
  error?: string;
  className?: string;
}

export type { PoolFillBarProps, PoolFillTotals };
