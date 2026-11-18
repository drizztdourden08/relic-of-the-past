/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
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
  label: Text;
  description: Text;
  color: StackedBarColor;
}

export type { PoolFillBarProps, PoolFillTotals, SegmentEntry };
