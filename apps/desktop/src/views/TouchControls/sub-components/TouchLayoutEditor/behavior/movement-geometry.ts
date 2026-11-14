/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { movementRadiusPx, toPx } from '@rotp/input-mapping';
import type { ScreenBox } from '@rotp/input-mapping';
import type { MovementGeometry } from './movement-geometry.type';

const movementGeometry = (layout: OrientationLayout, box: ScreenBox): MovementGeometry => {
  const radiusPx = movementRadiusPx(layout, box);
  const type = layout.movementType;
  if (type === 'dynamic-stick') {
    const { zone } = layout.movements['dynamic-stick'];
    return {
      zone: { left: zone.x * box.width, top: zone.y * box.height, width: zone.w * box.width, height: zone.h * box.height },
      centre: null,
      radiusPx,
    };
  }
  return { zone: null, centre: toPx(layout.movements[type].at, box), radiusPx };
};

export { movementGeometry };