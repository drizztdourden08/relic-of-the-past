/* @layer shared-asset-extraction @kind types */
type SegmentEnd = 'switch' | 'finish' | 'error';

interface StreamLayout {
  commandStart: number;
  switchBank: number;
  finish: number;
  dictBase: number;
  dictCount: number;
  commandLengths: readonly number[];
  escape: number | null;
  ignoresBankBytes: boolean;
  stopAfter: number | null;
}

interface ScanBudget {
  steps: number;
}

interface SegmentScan {
  bytes: Uint8Array;
  layout: StreamLayout;
  budget: ScanBudget;
}

interface SegmentRequest {
  start: number;
  before: number;
}

interface SegmentResult {
  end: SegmentEnd;
  count: number;
  stop: number;
  firstEnd: number;
}

interface SegmentWant {
  end: 'switch' | 'finish';
  counts: readonly number[];
  before: number;
  hints: readonly number[];
}

interface StreamPlan {
  starts: number[];
  moved: string[];
}

interface StreamSearch {
  scan: SegmentScan;
  romAddrs: readonly number[];
  hints: readonly number[];
}

export type {
  ScanBudget, SegmentEnd, SegmentRequest, SegmentResult, SegmentScan, SegmentWant, StreamLayout, StreamPlan,
  StreamSearch,
};
