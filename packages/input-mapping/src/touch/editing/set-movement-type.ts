/* @layer shared-input @kind logic */
import type { MovementType, OrientationLayout } from '@rotp/features';

/** Switches the movement control; each type keeps its own spot. */
const setMovementType = (layout: OrientationLayout, type: MovementType): OrientationLayout => ({
  ...layout,
  movementType: type,
});

export { setMovementType };
