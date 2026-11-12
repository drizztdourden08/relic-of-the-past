/* @layer shared-input @kind constants */
import type { TouchEmit } from '@rotp/features';

/** The hidStates key the touch overlay publishes its virtual pad under. */
const TOUCH_PAD_KEY = 'touch:0';

/** Number of buttons on the virtual pad (W3C standard gamepad layout). */
const TOUCH_PAD_BUTTON_COUNT = 16;

/** Number of axes on the virtual pad: left stick x, left stick y, right stick x, right stick y. */
const TOUCH_PAD_AXIS_COUNT = 4;

/**
 * Touch emit to W3C standard gamepad button index. The face buttons follow position,
 * so the SNES B (bottom) is index 0 and A (right) is index 1.
 */
const EMIT_TO_PAD_INDEX: Readonly<Record<TouchEmit, number>> = {
  b: 0,
  a: 1,
  y: 2,
  x: 3,
  l: 4,
  r: 5,
  l2: 6,
  r2: 7,
  select: 8,
  start: 9,
  l3: 10,
  r3: 11,
  up: 12,
  down: 13,
  left: 14,
  right: 15,
};

/** Diameter of a scale-1 button as a fraction of the screen's shorter side. */
const TOUCH_BASE_SIZE = 0.13;

/** Snap grid cell sizes as a fraction of the screen's shorter side. */
const SNAP_CELL_SIZE: Readonly<Record<'s' | 'm' | 'l', number>> = { s: 0.025, m: 0.05, l: 0.1 };

export { EMIT_TO_PAD_INDEX, SNAP_CELL_SIZE, TOUCH_BASE_SIZE, TOUCH_PAD_AXIS_COUNT, TOUCH_PAD_BUTTON_COUNT, TOUCH_PAD_KEY };
