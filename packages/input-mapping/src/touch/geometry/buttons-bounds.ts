/* @layer shared-input @kind logic */
import type { TouchButton } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { buttonHitBox } from './button-hit-box';
import type { PxBounds } from './px-bounds.type';

const buttonsBounds = (buttons: readonly TouchButton[], box: ScreenBox): PxBounds | null => {
  if (buttons.length === 0) return null;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const button of buttons) {
    const hit = buttonHitBox(button, box);
    left = Math.min(left, hit.center.x - hit.halfW);
    right = Math.max(right, hit.center.x + hit.halfW);
    top = Math.min(top, hit.center.y - hit.halfH);
    bottom = Math.max(bottom, hit.center.y + hit.halfH);
  }
  return { center: { x: (left + right) / 2, y: (top + bottom) / 2 }, halfW: (right - left) / 2, halfH: (bottom - top) / 2 };
};

export { buttonsBounds };
