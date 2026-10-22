/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '../PoolFillBar';

interface PoolListingRow {
  name: string;
  count: number;
  sprite?: string;
}

interface PoolListingGroup {
  id: string;
  label: string;
  total: number;
  rows: readonly PoolListingRow[];
}

interface PoolListingProps {
  groups: readonly PoolListingGroup[];
  totals: PoolFillTotals | null;
  error?: string;
  titled?: boolean;
  className?: string;
}

export type { PoolListingGroup, PoolListingProps, PoolListingRow };
