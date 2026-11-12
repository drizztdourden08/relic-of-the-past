/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchPoint, TouchSnap } from '@rotp/features';
import { clampNumber } from '../geometry/clamp-number';
import { clampPoint } from '../geometry/clamp-point';
import { clampRect } from '../geometry/clamp-rect';
import { snapPoint } from '../geometry/snap-point';
import type { ScreenBox } from '../touch-logic.type';

const MIN_ZONE_SIZE = 0.15;

/** Moves the dynamic zone's bottom-right corner by the total drag offset, keeping a minimum size inside the screen. */
const resizeZone = (layout: OrientationLayout, delta: TouchPoint, snap: TouchSnap, box: ScreenBox): OrientationLayout => {
  const stick = layout.movements['dynamic-stick'];
  const moved = clampPoint({ x: stick.zone.x + stick.zone.w + delta.x, y: stick.zone.y + stick.zone.h + delta.y });
  const corner = snap.enabled ? clampPoint(snapPoint(moved, snap.cell, box)) : moved;
  const w = clampNumber(corner.x - stick.zone.x, MIN_ZONE_SIZE, Math.max(MIN_ZONE_SIZE, 1 - stick.zone.x));
  const h = clampNumber(corner.y - stick.zone.y, MIN_ZONE_SIZE, Math.max(MIN_ZONE_SIZE, 1 - stick.zone.y));
  const zone = clampRect({ ...stick.zone, w, h });
  return { ...layout, movements: { ...layout.movements, 'dynamic-stick': { ...stick, zone } } };
};

export { resizeZone };
