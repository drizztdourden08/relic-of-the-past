/* @layer renderer-components @kind types */
import type { SeriesTone } from '../../primitives/SegmentedBar';

interface LegendEntry {
  key: string;
  label: string;
  value: number;
  tone: SeriesTone;
  /** A longer explanation, shown on hover. */
  title?: string;
}

interface LegendTotal {
  label: string;
  value: number;
  title?: string;
}

/**
 * `inline` runs the entries along one wrapping line, count before label. `stacked` gives
 * each entry its own row, the count at the row's right end, and the total as a last row.
 */
type LegendVariant = 'inline' | 'stacked';

interface LegendProps {
  entries: readonly LegendEntry[];
  total?: LegendTotal;
  variant?: LegendVariant;
  className?: string;
}

export type { LegendEntry, LegendProps, LegendTotal, LegendVariant };
