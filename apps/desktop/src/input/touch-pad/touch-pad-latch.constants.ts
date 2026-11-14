/* @layer renderer-lib @kind constants */

const MIN_PRESS_MS = 60;

const TOUCH_LATCH = {
  pressedAt: new Map<number, number>(),
  timer: null as ReturnType<typeof setTimeout> | null,
};

export { MIN_PRESS_MS, TOUCH_LATCH };
