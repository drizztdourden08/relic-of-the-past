/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { buttonsBounds } from './buttons-bounds';
import { movementBounds } from './movement-bounds';
import type { PxBounds } from './px-bounds.type';

const movedBounds = (before: OrientationLayout, after: OrientationLayout, box: ScreenBox): PxBounds | null => {
  const moved = after.buttons.filter((button) => !before.buttons.includes(button));
  if (moved.length > 0) return buttonsBounds(moved, box);
  const type = after.movementType;
  return after.movements[type] === before.movements[type] ? null : movementBounds(after, box);
};

export { movedBounds };
