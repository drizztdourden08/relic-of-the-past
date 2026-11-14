/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { basePx, movementRadiusPx, toPx } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';

const layerGeometry = (
  layout: OrientationLayout,
  box: ScreenBox,
): { size: number; radius: number; fixedBase: PxPoint | null } => ({
  size: basePx(box),
  radius: movementRadiusPx(layout, box),
  fixedBase: layout.movementType === 'fixed-stick' ? toPx(layout.movements['fixed-stick'].at, box) : null,
});

export { layerGeometry };
