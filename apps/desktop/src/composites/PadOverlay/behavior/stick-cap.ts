/* @layer renderer-components @kind logic */
import { DEGREES_PER_RADIAN, STICK_ACTIVE_DEFLECTION } from '../PadOverlay.constants';
import type { PartState, StickCap } from '../PadOverlay.type';

const stickCap = (state: PartState | undefined, travel: number): StickCap => {
  const x = state?.x ?? 0;
  const y = state?.y ?? 0;
  const length = Math.hypot(x, y);
  const reach = length > 1 ? 1 / length : 1;
  return {
    dx: x * reach * travel,
    dy: -y * reach * travel,
    angle: Math.atan2(x, y) * DEGREES_PER_RADIAN,
    deflected: length >= STICK_ACTIVE_DEFLECTION,
  };
};

export { stickCap };
