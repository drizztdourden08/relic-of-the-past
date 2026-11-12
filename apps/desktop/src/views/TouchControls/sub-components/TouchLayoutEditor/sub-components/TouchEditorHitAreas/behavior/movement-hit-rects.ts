/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import { movementGeometry } from '../../../behavior/movement-geometry';
import { MIN_HIT_PX, RESIZE_HANDLE_PX } from '../../../TouchLayoutEditor.constants';
import type { MovementHitRects } from './movement-hit-rects.type';

const movementHitRects = (layout: OrientationLayout, box: ScreenBox): MovementHitRects => {
  const { zone, centre, radiusPx } = movementGeometry(layout, box);
  if (zone) {
    const handle = {
      left: zone.left + zone.width - RESIZE_HANDLE_PX,
      top: zone.top + zone.height - RESIZE_HANDLE_PX,
      width: RESIZE_HANDLE_PX,
      height: RESIZE_HANDLE_PX,
    };
    return { area: zone, handle, round: false };
  }
  if (!centre) return { area: null, handle: null, round: true };
  const half = Math.max(radiusPx, MIN_HIT_PX / 2);
  return { area: { left: centre.x - half, top: centre.y - half, width: half * 2, height: half * 2 }, handle: null, round: true };
};

export { movementHitRects };
