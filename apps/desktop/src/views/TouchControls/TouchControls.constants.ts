/* @layer renderer-app @kind constants */
import type { TouchViewState } from './TouchControls.type';

const IDLE_VIEW: TouchViewState = {
  pressed: new Set<string>(),
  stick: null,
  dpad: { up: false, down: false, left: false, right: false },
};

/** A hold on empty space counts as still while the finger stays within this many px. */
const HOLD_SLOP_PX = 12;

/** The hold ring appears after this long, then fills until the menu opens. */
const HOLD_RING_DELAY_MS = 300;

export { HOLD_RING_DELAY_MS, HOLD_SLOP_PX, IDLE_VIEW };
