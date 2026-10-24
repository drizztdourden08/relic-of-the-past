/* @layer renderer-components @kind logic */
import { LABEL_PAD, LEADER_SPACING } from '../PadOverlay.constants';
import { rectsOverlap } from './rects-overlap';
import { segmentDistance } from './segment-distance';
import { segmentHitsRect } from './segment-hits-rect';
import type { LabelOption, Occupied } from './placement.type';

const optionFits = (option: LabelOption, occupied: Occupied): boolean => {
  const { rect } = option.spot;
  if (occupied.rects.some((other) => rectsOverlap(rect, other, LABEL_PAD))) return false;
  if (occupied.segments.some((segment) => segmentHitsRect(segment, rect))) return false;
  return option.segments.every((segment) =>
    !occupied.rects.some((other) => segmentHitsRect(segment, other))
    && occupied.segments.every((other) => segmentDistance(segment, other) >= LEADER_SPACING));
};

export { optionFits };
