/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { movementRadiusPx, toPx } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';

interface PxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MovementGeometry {
  /** The dynamic stick's zone; null for the fixed stick and the D-pad. */
  zone: PxRect | null;
  /** The fixed stick's or D-pad's centre; null for the dynamic stick. */
  centre: PxPoint | null;
  radiusPx: number;
}

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
export type { MovementGeometry, PxRect };
