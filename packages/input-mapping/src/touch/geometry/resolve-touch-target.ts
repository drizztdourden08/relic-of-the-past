/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { PxPoint, ScreenBox, TouchTarget } from '../touch-logic.type';
import { buttonHitDistance } from './button-hit-distance';
import { hitsMovement } from './hits-movement';

/** Buttons first (nearest centre wins), then the movement control, then empty space. */
const resolveTouchTarget = (p: PxPoint, layout: OrientationLayout, box: ScreenBox): TouchTarget => {
  let bestId: string | null = null;
  let bestDistance = Infinity;
  for (const button of layout.buttons) {
    const distance = buttonHitDistance(p, button, box);
    if (distance !== null && distance < bestDistance) {
      bestId = button.id;
      bestDistance = distance;
    }
  }
  if (bestId !== null) return { kind: 'button', id: bestId };
  if (hitsMovement(p, layout, box)) return { kind: 'movement' };
  return { kind: 'empty' };
};

export { resolveTouchTarget };
