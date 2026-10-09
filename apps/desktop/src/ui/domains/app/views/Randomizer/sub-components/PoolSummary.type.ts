/* @layer renderer-components @kind types */
import type { PoolFillTotals } from '@domains/app/compounds/PoolFillBar';
import type { PoolAccounting } from '@rotp/randomizer';
import type { OptionsSummary } from '../behavior/options-summary.type';
import type { PanelPlacement } from '../Randomizer.type';

interface PoolSummaryProps {
  placement: PanelPlacement;
  accounting: PoolAccounting | null;
  totals: PoolFillTotals | null;
  error?: string;
  summary: OptionsSummary;
}

export type { PoolSummaryProps };
