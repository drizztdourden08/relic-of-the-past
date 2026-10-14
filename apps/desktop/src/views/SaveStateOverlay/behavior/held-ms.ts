/* @layer renderer-components @kind logic */
import type { HoldState } from '../SaveStateOverlay.type';

const heldMs = (hold: HoldState, holdDurationMs: number): number => {
  if (hold.start != null) return performance.now() - hold.start;
  return hold.complete ? holdDurationMs : 0;
};

export { heldMs };
