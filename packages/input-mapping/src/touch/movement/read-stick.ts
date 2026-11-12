/* @layer shared-input @kind logic */
import type { StickReading, StickState } from '../touch-logic.type';

/**
 * Reads a stick: unit direction times the thumb distance over the radius, with the dead zone
 * rescaled so the output is 0 at its edge and 1 at the radius. With a leash the base trails
 * the thumb so it is never further than the radius.
 */
const readStick = (state: StickState, radiusPx: number, deadZone: number, leash: boolean): StickReading => {
  let dx = state.thumb.x - state.base.x;
  let dy = state.thumb.y - state.base.y;
  let length = Math.hypot(dx, dy);
  let base = state.base;
  if (length === 0 || radiusPx <= 0) return { axes: [0, 0], base };
  const ux = dx / length;
  const uy = dy / length;
  if (leash && length > radiusPx) {
    base = { x: state.thumb.x - ux * radiusPx, y: state.thumb.y - uy * radiusPx };
    dx = ux * radiusPx;
    dy = uy * radiusPx;
    length = radiusPx;
  }
  const magnitude = Math.min(1, length / radiusPx);
  if (magnitude <= deadZone || deadZone >= 1) return { axes: [0, 0], base };
  const out = (magnitude - deadZone) / (1 - deadZone);
  return { axes: [ux * out, uy * out], base };
};

export { readStick };
