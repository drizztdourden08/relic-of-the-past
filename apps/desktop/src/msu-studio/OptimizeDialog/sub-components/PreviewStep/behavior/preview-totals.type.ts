/* @layer renderer-components @kind types */
interface PreviewTotals {
  currentBytes: number;
  estimatedBytes: number;
  measuredCount: number;
  unmeasuredCount: number;
  excludedCount: number;
  growingCount: number;
}

export type { PreviewTotals };
