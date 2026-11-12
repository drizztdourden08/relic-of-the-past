/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { PxPoint, ScreenBox } from '../touch-logic.type';
import { movementRadiusPx } from './movement-radius-px';
import { toPx } from './to-px';

const MOVEMENT_HIT_GROW = 1.25;

/** True when a touch lands on the current movement control: the zone rect for the dynamic stick, a circle for the others. */
const hitsMovement = (p: PxPoint, layout: OrientationLayout, box: ScreenBox): boolean => {
  if (layout.movementType === 'dynamic-stick') {
    const zone = layout.movements['dynamic-stick'].zone;
    const x = zone.x * box.width;
    const y = zone.y * box.height;
    return p.x >= x && p.x <= x + zone.w * box.width && p.y >= y && p.y <= y + zone.h * box.height;
  }
  const center = toPx(layout.movements[layout.movementType].at, box);
  return Math.hypot(p.x - center.x, p.y - center.y) <= movementRadiusPx(layout, box) * MOVEMENT_HIT_GROW;
};

export { hitsMovement };
