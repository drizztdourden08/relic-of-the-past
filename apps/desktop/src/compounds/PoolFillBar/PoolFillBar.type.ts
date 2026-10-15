/* @layer renderer-components @kind types */
import type { StackedBarColor } from '@drizztdourden08/tessera/primitives';

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
  className?: string;
}

type Segment = keyof PoolFillTotals;

interface SegmentEntry {
  key: Segment;
  label: string;
  description: string;
  color: StackedBarColor;
}

export type { PoolFillBarProps, PoolFillTotals, SegmentEntry };
