/* @layer renderer-components @kind logic */
import type { OptimizeCandidate } from '@shared/types/msu-optimize';
import { EMPTY } from './preview-totals.constants';
import type { PreviewTotals } from './preview-totals.type';

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
