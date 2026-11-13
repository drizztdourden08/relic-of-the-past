/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton } from '@rotp/features';
import { buttonsBounds } from '../geometry/buttons-bounds';
import { clampPoint } from '../geometry/clamp-point';
import { snapBounds } from '../geometry/snap-bounds';
import { toFraction } from '../geometry/to-fraction';
import type { ShiftMotion } from './shift-buttons.type';

const shiftButtons = (
  layout: OrientationLayout,
  moves: (button: TouchButton) => boolean,
  { delta, snap, box }: ShiftMotion,
): OrientationLayout => {
  const bounds = buttonsBounds(layout.buttons.filter(moves), box);
  if (!bounds) return layout;
  const shifted = { ...bounds, center: { x: bounds.center.x + delta.x * box.width, y: bounds.center.y + delta.y * box.height } };
  const start = toFraction(bounds.center, box);
  const target = snap.enabled ? snapBounds(shifted, snap.cell, box) : toFraction(shifted.center, box);
  const offset = { x: target.x - start.x, y: target.y - start.y };
  return {
    ...layout,
    buttons: layout.buttons.map((button) => (moves(button)
      ? { ...button, at: clampPoint({ x: button.at.x + offset.x, y: button.at.y + offset.y }) }
      : button)),
  };
};

export { shiftButtons };
