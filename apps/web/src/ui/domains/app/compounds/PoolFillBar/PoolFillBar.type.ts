/* @layer renderer-components @kind types */

/**
 * The pool against every location of the world, already reconciled: every
 * number is a count of items or locations, and items + upgrades + filler +
 * fixed + prizes + events together are exactly the bar's full width, the
 * same total the Checks widget shows for this seed.
 */
interface PoolFillTotals {
  /** Items in the pool that are neither a capacity upgrade nor filler: progression, useful, dungeon items. */
  items: number;
  /** Capacity upgrade items in the pool, each in a filler's place. */
  upgrades: number;
  /** Balance filler still in the pool. */
  filler: number;
  /** Spots settled before the shuffle: a locked vanilla item, the assured starting weapon. */
  fixed: number;
  /** The ten boss-reward slots, pre-placed from their own fixed pool outside the general fill. */
  prizes: number;
  /** Pure logic locations (Ganon, Agahnim, the flute spot): a location, but never a reward. */
  events: number;
}

interface PoolFillBarProps {
  /** Null when the pool could not be built; `error` then says why. */
  totals: PoolFillTotals | null;
  error?: string;
  className?: string;
}

export type { PoolFillBarProps, PoolFillTotals };
