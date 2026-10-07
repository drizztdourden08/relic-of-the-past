/* @layer renderer-components @kind types */

/** A named data-series colour (tokens/series.css). */
type SeriesTone = 'green' | 'upgrade' | 'warning' | 'danger' | 'info' | 'gold' | 'muted';

interface BarSegment {
  key: string;
  value: number;
  tone: SeriesTone;
}

interface SegmentedBarProps {
  /** Left to right. */
  segments: readonly BarSegment[];
  /** The full width; omitted, the segments' sum fills the bar. */
  max?: number;
  className?: string;
}

export type { BarSegment, SegmentedBarProps, SeriesTone };
