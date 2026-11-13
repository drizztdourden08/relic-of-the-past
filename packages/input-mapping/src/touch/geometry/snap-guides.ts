/* @layer shared-input @kind logic */
import type { SnapCell } from '@rotp/features';
import { SNAP_CELL_SIZE } from '../touch-emit.constants';
import type { ScreenBox } from '../touch-logic.type';
import type { PxBounds } from './px-bounds.type';
import type { SnapGuide, SnapGuides } from './snap-guides.type';
import { snapSide } from './snap-side';

const guideOf = (center: number, half: number, length: number, size: number): SnapGuide => {
  const side = snapSide(center, length, size);
  if (side === 'center') return { side, at: length / 2 };
  return { side, at: side === 'start' ? center - half : center + half };
};

const snapGuides = (bounds: PxBounds, cell: SnapCell, box: ScreenBox): SnapGuides => {
  const size = SNAP_CELL_SIZE[cell] * Math.min(box.width, box.height);
  return {
    x: guideOf(bounds.center.x, bounds.halfW, box.width, size),
    y: guideOf(bounds.center.y, bounds.halfH, box.height, size),
  };
};

export { snapGuides };
