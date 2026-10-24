/* @layer renderer-components @kind logic */
import type { Segment } from './placement.type';
import { pointSegmentDistance } from './point-segment-distance';
import { segmentsCross } from './segments-cross';

const segmentDistance = ([a, b]: Segment, [c, d]: Segment): number => {
  if (segmentsCross(a, b, c, d)) return 0;
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
};

export { segmentDistance };
