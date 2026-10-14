/* @layer renderer-components @kind logic */
import type { HoldState } from '../SaveStateOverlay.type';

const resetHold = (hold: HoldState): void => {
  hold.start = null;
  hold.slot = null;
  hold.complete = false;
  hold.awaiting = false;
  if (hold.anim != null) {
    cancelAnimationFrame(hold.anim);
    hold.anim = null;
  }
};

export { resetHold };
