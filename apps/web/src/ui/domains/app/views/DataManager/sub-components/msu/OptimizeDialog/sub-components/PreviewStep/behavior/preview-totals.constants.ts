/* @layer renderer-components @kind constants */
import type { PreviewTotals } from './preview-totals.type';

const EMPTY: PreviewTotals = {
  currentBytes: 0, estimatedBytes: 0, measuredCount: 0, unmeasuredCount: 0, excludedCount: 0, growingCount: 0,
};

export { EMPTY };
