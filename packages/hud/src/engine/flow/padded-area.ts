/* @layer shared-hud @kind logic */
import type { Edges } from '../../types/hud-node';
import type { Rect } from '../../layouts/geometry.type';
import { insetsOf } from './insets-of';

const paddedArea = (padding: Edges | undefined, box: Rect, unit: number): Rect => {
  const pad = insetsOf(padding);
  return {
    x: box.x + pad.left * unit,
    y: box.y + pad.top * unit,
    w: Math.max(0, box.w - (pad.left + pad.right) * unit),
    h: Math.max(0, box.h - (pad.top + pad.bottom) * unit),
  };
};

export { paddedArea };
