/* @layer renderer-components @kind logic */
import { GLYPH_REACH } from '../PadOverlay.constants';
import { pointSegmentDistance } from './point-segment-distance';
import { segmentHitsRect } from './segment-hits-rect';
import type { Rect, Scene, Segment } from './placement.type';

const shrink = (rect: Rect): Rect => ({ left: rect.left + 1, top: rect.top + 1, right: rect.right - 1, bottom: rect.bottom - 1 });

const routeClear = (segments: readonly Segment[], own: number, rect: Rect, scene: Scene): boolean => {
  const part = scene.parts[own];
  if (!part) return false;
  const ownReach = part.radius * GLYPH_REACH[part.slot.kind];
  const inner = shrink(rect);
  return segments.every((segment, index) => {
    const [a, b] = segment;
    if (segmentHitsRect(segment, inner)) return false;
    if (index > 0 && pointSegmentDistance(part, a, b) < ownReach) return false;
    return scene.circles.every((circle, at) => at === own || pointSegmentDistance(circle, a, b) >= circle.r);
  });
};

export { routeClear };
