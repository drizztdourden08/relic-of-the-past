/* @layer shared-input @kind logic */
import type { StickReading, StickState } from '../touch-logic.type';

const readStick = (state: StickState, radiusPx: number, deadZone: number): StickReading => {
  const dx = state.thumb.x - state.base.x;
  const dy = state.thumb.y - state.base.y;
  const length = Math.hypot(dx, dy);
  const { base } = state;
  if (length === 0 || radiusPx <= 0) return { axes: [0, 0], base };
  const magnitude = Math.min(1, length / radiusPx);
  if (magnitude <= deadZone || deadZone >= 1) return { axes: [0, 0], base };
  const out = (magnitude - deadZone) / (1 - deadZone);
  return { axes: [(dx / length) * out, (dy / length) * out], base };
};

export { readStick };
