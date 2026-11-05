/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '@app/compounds/PoolFillBar';
import type { PoolAccounting } from '@rotp/randomizer';
import type { OptionsSummary } from '../behavior/options-summary.type';

interface PoolSummaryProps {
  accounting: PoolAccounting | null;
  totals: PoolFillTotals | null;
  error?: string;
  summary: OptionsSummary;
}

export type { PoolSummaryProps };
