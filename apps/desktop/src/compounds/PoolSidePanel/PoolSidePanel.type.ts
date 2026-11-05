/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '../PoolFillBar';
import type { PoolListingGroup } from '../PoolListing';

interface PoolSidePanelProps {
  groups: readonly PoolListingGroup[];
  totals: PoolFillTotals | null;
  error?: string;
}

export type { PoolSidePanelProps };
