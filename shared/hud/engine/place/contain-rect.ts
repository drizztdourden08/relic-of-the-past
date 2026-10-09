/* @layer shared-hud @kind logic */
import type { Rect, Size } from '../../layouts/geometry.type';

const containRect = (content: Size, box: Rect): Rect => {
  if (content.w <= 0 || content.h <= 0) return { ...box };
  const fit = Math.min(box.w / content.w, box.h / content.h);
  const w = content.w * fit;
  const h = content.h * fit;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
};

export { containRect };
