/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { snapPoint } from '../geometry/snap-point';
import type { MoveGroupOptions } from './move-group.type';

const moveGroup = (layout: OrientationLayout, { groupId, delta, snap, box }: MoveGroupOptions): OrientationLayout => {
  const anchor = layout.buttons.find((button) => button.group === groupId);
  if (!anchor) return layout;
  const moved = clampPoint({ x: anchor.at.x + delta.x, y: anchor.at.y + delta.y });
  const target = snap.enabled ? clampPoint(snapPoint(moved, snap.cell, box)) : moved;
  const offset = { x: target.x - anchor.at.x, y: target.y - anchor.at.y };
  return {
    ...layout,
    buttons: layout.buttons.map((button) => (button.group === groupId
      ? { ...button, at: clampPoint({ x: button.at.x + offset.x, y: button.at.y + offset.y }) }
      : button)),
  };
};

export { moveGroup };
