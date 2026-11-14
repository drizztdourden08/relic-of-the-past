/* @layer shared-input @kind logic */
import type { SnapCell, TouchPoint } from '@rotp/features';
import { SNAP_CELL_SIZE } from '../touch-emit.constants';
import type { ScreenBox } from '../touch-logic.type';
import { toFraction } from './to-fraction';
import { toPx } from './to-px';

const snapPoint = (p: TouchPoint, cell: SnapCell, box: ScreenBox): TouchPoint => {
  const size = SNAP_CELL_SIZE[cell] * Math.min(box.width, box.height);
  const px = toPx(p, box);
  return toFraction({ x: Math.round(px.x / size) * size, y: Math.round(px.y / size) * size }, box);
};

export { snapPoint };
