/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { clampNumber } from '../geometry/clamp-number';

const MIN_MOVEMENT_SCALE = 0.8;
const MAX_MOVEMENT_SCALE = 2.2;

/** Sets the current movement control's scale (0.8..2.2). */
const setMovementScale = (layout: OrientationLayout, scale: number): OrientationLayout => {
  const type = layout.movementType;
  const value = clampNumber(scale, MIN_MOVEMENT_SCALE, MAX_MOVEMENT_SCALE);
  return { ...layout, movements: { ...layout.movements, [type]: { ...layout.movements[type], scale: value } } };
};

export { setMovementScale };
