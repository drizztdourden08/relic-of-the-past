/* @layer shared-input @kind logic */
import type { MovementType, OrientationLayout } from '@rotp/features';

const setMovementType = (layout: OrientationLayout, type: MovementType): OrientationLayout => ({
  ...layout,
  movementType: type,
});

export { setMovementType };
