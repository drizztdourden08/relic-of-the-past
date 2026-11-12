/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchPoint, TouchSnap } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { clampRect } from '../geometry/clamp-rect';
import { snapPoint } from '../geometry/snap-point';
import type { ScreenBox } from '../touch-logic.type';

const moveMovement = (layout: OrientationLayout, delta: TouchPoint, snap: TouchSnap, box: ScreenBox): OrientationLayout => {
  const place = (p: TouchPoint): TouchPoint => {
    const clamped = clampPoint(p);
    return snap.enabled ? clampPoint(snapPoint(clamped, snap.cell, box)) : clamped;
  };
  const type = layout.movementType;
  if (type === 'dynamic-stick') {
    const stick = layout.movements['dynamic-stick'];
    const corner = place({ x: stick.zone.x + delta.x, y: stick.zone.y + delta.y });
    const zone = clampRect({ ...stick.zone, x: corner.x, y: corner.y });
    return { ...layout, movements: { ...layout.movements, 'dynamic-stick': { ...stick, zone } } };
  }
  const piece = layout.movements[type];
  const at = place({ x: piece.at.x + delta.x, y: piece.at.y + delta.y });
  return { ...layout, movements: { ...layout.movements, [type]: { ...piece, at } } };
};

export { moveMovement };
