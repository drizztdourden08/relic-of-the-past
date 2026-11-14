/* @layer shared-input @kind logic */
import type { TouchButton } from '@rotp/features';
import type { PxPoint, ScreenBox } from '../touch-logic.type';
import { buttonHitBox } from './button-hit-box';
import { HIT_GROW } from './button-hit-distance.constants';

const buttonHitDistance = (p: PxPoint, button: TouchButton, box: ScreenBox): number | null => {
  const hit = buttonHitBox(button, box);
  const dx = p.x - hit.center.x;
  const dy = p.y - hit.center.y;
  const halfW = hit.halfW * HIT_GROW;
  const halfH = hit.halfH * HIT_GROW;
  const inside = hit.round ? Math.hypot(dx, dy) <= halfW : Math.abs(dx) <= halfW && Math.abs(dy) <= halfH;
  return inside ? Math.hypot(dx, dy) : null;
};

export { buttonHitDistance };
