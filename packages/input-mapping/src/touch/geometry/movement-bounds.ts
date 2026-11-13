/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { movementRadiusPx } from './movement-radius-px';
import type { PxBounds } from './px-bounds.type';

const movementBounds = (layout: OrientationLayout, box: ScreenBox): PxBounds => {
  const type = layout.movementType;
  if (type === 'dynamic-stick') {
    const { zone } = layout.movements['dynamic-stick'];
    const halfW = (zone.w * box.width) / 2;
    const halfH = (zone.h * box.height) / 2;
    return { center: { x: zone.x * box.width + halfW, y: zone.y * box.height + halfH }, halfW, halfH };
  }
  const piece = layout.movements[type];
  const radius = movementRadiusPx(layout, box);
  return { center: { x: piece.at.x * box.width, y: piece.at.y * box.height }, halfW: radius, halfH: radius };
};

export { movementBounds };
