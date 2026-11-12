/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchPoint, TouchSnap } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { snapPoint } from '../geometry/snap-point';
import type { ScreenBox } from '../touch-logic.type';
import { lockedGroupOf } from './locked-group-of';

/**
 * Moves a button by the total drag offset from the layout at drag start. A member of a locked
 * group drags the whole group by the dragged button's actual offset; anything else moves alone.
 */
const moveButton = (
  layout: OrientationLayout,
  id: string,
  delta: TouchPoint,
  snap: TouchSnap,
  box: ScreenBox,
): OrientationLayout => {
  const dragged = layout.buttons.find((button) => button.id === id);
  if (!dragged) return layout;
  const moved = clampPoint({ x: dragged.at.x + delta.x, y: dragged.at.y + delta.y });
  const target = snap.enabled ? clampPoint(snapPoint(moved, snap.cell, box)) : moved;
  const offset = { x: target.x - dragged.at.x, y: target.y - dragged.at.y };
  const groupId = lockedGroupOf(layout, dragged);
  return {
    ...layout,
    buttons: layout.buttons.map((button) => {
      if (button.id === id) return { ...button, at: target };
      if (groupId !== null && button.group === groupId) {
        return { ...button, at: clampPoint({ x: button.at.x + offset.x, y: button.at.y + offset.y }) };
      }
      return button;
    }),
  };
};

export { moveButton };
