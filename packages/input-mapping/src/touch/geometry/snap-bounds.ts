/* @layer shared-input @kind logic */
import type { SnapCell, TouchPoint } from '@rotp/features';
import { SNAP_CELL_SIZE } from '../touch-emit.constants';
import type { ScreenBox } from '../touch-logic.type';
import type { PxBounds } from './px-bounds.type';
import { snapSpan } from './snap-span';
import { toFraction } from './to-fraction';

const snapBounds = (bounds: PxBounds, cell: SnapCell, box: ScreenBox): TouchPoint => {
  const size = SNAP_CELL_SIZE[cell] * Math.min(box.width, box.height);
  return toFraction({
    x: snapSpan(bounds.center.x, bounds.halfW, box.width, size),
    y: snapSpan(bounds.center.y, bounds.halfH, box.height, size),
  }, box);
};

export { snapBounds };
