/* @layer renderer-components @kind logic */
/**
 * Only MEASURED rows are summed: folding an unmeasured file in at its current size would present a
 * guess as part of a measured total. Growth counts like saving, so a pack of mp3s shows the total
 * getting bigger instead of a flattering net figure.
 */
import type { OptimizeCandidate } from '@shared/types/msu-optimize';

interface PreviewTotals {
  /** Current size of the measured rows only. */
  currentBytes: number;
  /** Measured size of those same rows. */
  estimatedBytes: number;
  measuredCount: number;
  /** Convertible rows nothing could be measured for. */
  unmeasuredCount: number;
  excludedCount: number;
  /** Rows the target format would make BIGGER. */
  growingCount: number;
}

const EMPTY: PreviewTotals = {
  currentBytes: 0, estimatedBytes: 0, measuredCount: 0, unmeasuredCount: 0, excludedCount: 0, growingCount: 0,
};

const previewTotals = (candidates: OptimizeCandidate[]): PreviewTotals =>
  candidates.reduce<PreviewTotals>((totals, row) => {
    if (row.excludedBecause !== null) return { ...totals, excludedCount: totals.excludedCount + 1 };
    if (row.estimatedBytes === null) return { ...totals, unmeasuredCount: totals.unmeasuredCount + 1 };
    return {
      ...totals,
      currentBytes: totals.currentBytes + row.currentBytes,
      estimatedBytes: totals.estimatedBytes + row.estimatedBytes,
      measuredCount: totals.measuredCount + 1,
      growingCount: totals.growingCount + (row.estimatedBytes > row.currentBytes ? 1 : 0),
    };
  }, EMPTY);

export { previewTotals };
export type { PreviewTotals };
