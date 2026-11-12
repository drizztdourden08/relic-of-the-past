/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { clampNumber } from '../geometry/clamp-number';
import { MAX_MOVEMENT_SCALE, MIN_MOVEMENT_SCALE } from './set-movement-scale.constants';

const setMovementScale = (layout: OrientationLayout, scale: number): OrientationLayout => {
  const type = layout.movementType;
  const value = clampNumber(scale, MIN_MOVEMENT_SCALE, MAX_MOVEMENT_SCALE);
  return { ...layout, movements: { ...layout.movements, [type]: { ...layout.movements[type], scale: value } } };
};

export { setMovementScale };
