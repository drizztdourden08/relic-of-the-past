/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '../PoolFillBar';

interface PoolTotalsProps {
  totals: PoolFillTotals | null;
  error?: string;
}

export type { PoolTotalsProps };
