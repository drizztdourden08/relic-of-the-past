/* @layer renderer-lib @kind logic */
import type { PoseFrame } from '@rotp/game-data';
import { QUAD_PX } from './thumbnail-bounds.constants';
import type { FrameBounds } from './thumbnail.type';

const frameBounds = (frame: PoseFrame): FrameBounds => {
  const left = Math.min(...frame.quads.map((q) => q.dx));
  const top = Math.min(...frame.quads.map((q) => q.dy));
  const right = Math.max(...frame.quads.map((q) => q.dx + QUAD_PX));
  const bottom = Math.max(...frame.quads.map((q) => q.dy + QUAD_PX));
  return { width: right - left, height: bottom - top, originX: -left, originY: -top };
};

export { frameBounds };
