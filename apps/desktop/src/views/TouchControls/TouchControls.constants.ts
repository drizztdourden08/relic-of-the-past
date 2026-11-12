/* @layer renderer-app @kind constants */
import type { TouchViewState } from './TouchControls.type';

const IDLE_VIEW: TouchViewState = {
  pressed: new Set<string>(),
  stick: null,
  dpad: { up: false, down: false, left: false, right: false },
};

const HOLD_SLOP_PX = 12;

const HOLD_RING_DELAY_MS = 300;

export { HOLD_RING_DELAY_MS, HOLD_SLOP_PX, IDLE_VIEW };
