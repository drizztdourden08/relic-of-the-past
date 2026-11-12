/* @layer renderer-app @kind constants */
import type { TouchViewState } from './TouchControls.type';

const IDLE_VIEW: TouchViewState = {
  pressed: new Set<string>(),
  stick: null,
  dpad: { up: false, down: false, left: false, right: false },
};

const HOLD_SLOP_PX = 12;

const HOLD_RING_DELAY_MS = 300;

const HAPTIC_MIN_MS = 4;

const HAPTIC_MAX_MS = 40;

export { HAPTIC_MAX_MS, HAPTIC_MIN_MS, HOLD_RING_DELAY_MS, HOLD_SLOP_PX, IDLE_VIEW };
