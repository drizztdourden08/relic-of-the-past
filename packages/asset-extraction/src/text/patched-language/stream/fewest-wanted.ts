/* @layer shared-asset-extraction @kind logic */
import { MIN_SEGMENT_MESSAGES } from './stream.constants';
import type { SegmentWant } from './stream.type';

const fewestWanted = (want: SegmentWant): number =>
  want.counts.length === 0 ? MIN_SEGMENT_MESSAGES : Math.min(...want.counts);

export { fewestWanted };
