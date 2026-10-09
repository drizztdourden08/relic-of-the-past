/* @layer renderer-components @kind types */
import type { LegendEntry, LegendVariant } from '@drizztdourden08/tessera/composites';

interface PoolFillTotals {
  items: number;
  upgrades: number;
  filler: number;
  fixed: number;
  prizes: number;
}

interface PoolFillBarProps {
  totals: PoolFillTotals | null;
  error?: string;
  legend?: LegendVariant;
  className?: string;
}

type Segment = keyof PoolFillTotals;

type SegmentEntry = Omit<LegendEntry, 'key' | 'value'> & { key: Segment };

export type { PoolFillBarProps, PoolFillTotals, Segment, SegmentEntry };
