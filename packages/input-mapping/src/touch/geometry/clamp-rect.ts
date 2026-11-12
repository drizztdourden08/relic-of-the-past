/* @layer shared-input @kind logic */
import type { TouchRect } from '@rotp/features';
import { clampNumber } from './clamp-number';

const clampRect = (r: TouchRect): TouchRect => {
  const w = clampNumber(r.w, 0, 1);
  const h = clampNumber(r.h, 0, 1);
  return { x: clampNumber(r.x, 0, 1 - w), y: clampNumber(r.y, 0, 1 - h), w, h };
};

export { clampRect };
