/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchPoint, TouchSnap } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { clampRect } from '../geometry/clamp-rect';
import { movementRadiusPx } from '../geometry/movement-radius-px';
import type { PxBounds } from '../geometry/px-bounds.type';
import { snapBounds } from '../geometry/snap-bounds';
import { toFraction } from '../geometry/to-fraction';
import type { ScreenBox } from '../touch-logic.type';

const moveMovement = (layout: OrientationLayout, delta: TouchPoint, snap: TouchSnap, box: ScreenBox): OrientationLayout => {
  const place = (bounds: PxBounds): TouchPoint => clampPoint(snap.enabled ? snapBounds(bounds, snap.cell, box) : toFraction(bounds.center, box));
  const type = layout.movementType;
  if (type === 'dynamic-stick') {
    const stick = layout.movements['dynamic-stick'];
    const halfW = (stick.zone.w * box.width) / 2;
    const halfH = (stick.zone.h * box.height) / 2;
    const center = { x: (stick.zone.x + delta.x) * box.width + halfW, y: (stick.zone.y + delta.y) * box.height + halfH };
    const mid = place({ center, halfW, halfH });
    const zone = clampRect({ ...stick.zone, x: mid.x - stick.zone.w / 2, y: mid.y - stick.zone.h / 2 });
    return { ...layout, movements: { ...layout.movements, 'dynamic-stick': { ...stick, zone } } };
  }
  const piece = layout.movements[type];
  const radius = movementRadiusPx(layout, box);
  const center = { x: (piece.at.x + delta.x) * box.width, y: (piece.at.y + delta.y) * box.height };
  const at = place({ center, halfW: radius, halfH: radius });
  return { ...layout, movements: { ...layout.movements, [type]: { ...piece, at } } };
};

export { moveMovement };
