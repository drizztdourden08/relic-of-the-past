/* @layer shared-input @kind constants */
import type { TouchEmit } from '@rotp/features';

const TOUCH_PAD_KEY = 'touch:0';

const TOUCH_PAD_BUTTON_COUNT = 16;

const TOUCH_PAD_AXIS_COUNT = 4;

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

const TOUCH_BASE_SIZE = 0.13;

const SNAP_CELL_SIZE: Readonly<Record<'s' | 'm' | 'l', number>> = { s: 0.025, m: 0.05, l: 0.1 };

export { EMIT_TO_PAD_INDEX, SNAP_CELL_SIZE, TOUCH_BASE_SIZE, TOUCH_PAD_AXIS_COUNT, TOUCH_PAD_BUTTON_COUNT, TOUCH_PAD_KEY };
