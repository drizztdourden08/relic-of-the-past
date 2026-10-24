/* @layer renderer-components @kind logic */
import { LABEL_PAD, LEADER_SPACING } from '../PadOverlay.constants';
import { rectsOverlap } from './rects-overlap';
import { segmentDistance } from './segment-distance';
import { segmentHitsRect } from './segment-hits-rect';
import type { LabelOption } from './placement.type';

const optionsCompatible = (a: LabelOption, b: LabelOption): boolean => {
  if (rectsOverlap(a.spot.rect, b.spot.rect, LABEL_PAD)) return false;
  if (a.segments.some((segment) => segmentHitsRect(segment, b.spot.rect))) return false;
  if (b.segments.some((segment) => segmentHitsRect(segment, a.spot.rect))) return false;
  return a.segments.every((segment) => b.segments.every((other) => segmentDistance(segment, other) >= LEADER_SPACING));
};

export { optionsCompatible };
