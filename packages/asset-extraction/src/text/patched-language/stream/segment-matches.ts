/* @layer shared-asset-extraction @kind logic */
import { MIN_SEGMENT_MESSAGES } from './stream.constants';
import type { SegmentResult, SegmentWant } from './stream.type';

const segmentMatches = (result: SegmentResult, want: SegmentWant): boolean => {
  if (result.end !== want.end) return false;
  return want.counts.length === 0 ? result.count >= MIN_SEGMENT_MESSAGES : want.counts.includes(result.count);
};

export { segmentMatches };
