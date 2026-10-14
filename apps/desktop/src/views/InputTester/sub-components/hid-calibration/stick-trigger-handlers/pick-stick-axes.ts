/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';

const pickStickAxes = (c1: StickCandidate, c2: StickCandidate | null): { x: StickCandidate; y: StickCandidate | null } => {
  if (!c2) return { x: c1, y: null };
  return c1.idx < c2.idx ? { x: c1, y: c2 } : { x: c2, y: c1 };
};

export { pickStickAxes };
