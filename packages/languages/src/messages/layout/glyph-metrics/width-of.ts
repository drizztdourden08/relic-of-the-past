/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import { FALLBACK_ADVANCE_PX } from './glyph-metrics.constants';

const widthOf = (index: number, metrics: GlyphMetrics): number => {
  return metrics.widths[index] ?? FALLBACK_ADVANCE_PX;
};

export { widthOf };
