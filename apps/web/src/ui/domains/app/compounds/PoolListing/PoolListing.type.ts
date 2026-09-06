/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '../PoolFillBar';

interface PoolListingRow {
  name: string;
  count: number;
  /** URL of the item's extracted sprite; absent draws a neutral placeholder. */
  sprite?: string;
}

interface PoolListingGroup {
  id: string;
  label: string;
  /** Items in the group, duplicates counted. */
  total: number;
  rows: readonly PoolListingRow[];
}

interface PoolListingProps {
  groups: readonly PoolListingGroup[];
  /** Null when the pool could not be built; `error` then says why. */
  totals: PoolFillTotals | null;
  error?: string;
  className?: string;
}

export type { PoolListingGroup, PoolListingProps, PoolListingRow };
