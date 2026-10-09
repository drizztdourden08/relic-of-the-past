/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import { FALLBACK_ADVANCE_PX } from './glyph-metrics.constants';

const widthOf = (index: number, metrics: GlyphMetrics): number => {
  const advance = metrics.widths[index];
  return advance === undefined ? FALLBACK_ADVANCE_PX : advance;
};

export { widthOf };
