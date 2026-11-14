/* @layer renderer-lib @kind logic */
import type { PadState } from '@rotp/input-mapping';
import { stopLatchTimer } from './stop-latch-timer';
import { MIN_PRESS_MS, TOUCH_LATCH } from './touch-pad-latch.constants';

const holdOpen = (raw: PadState, now: number): { buttons: boolean[]; wait: number } => {
  let wait = 0;
  const buttons = raw.buttons.map((down, index) => {
    const since = TOUCH_LATCH.pressedAt.get(index);
    if (down) {
      if (since === undefined) TOUCH_LATCH.pressedAt.set(index, now);
      return true;
    }
    if (since === undefined) return false;
    const left = MIN_PRESS_MS - (now - since);
    if (left <= 0) {
      TOUCH_LATCH.pressedAt.delete(index);
      return false;
    }
    wait = Math.max(wait, left);
    return true;
  });
  return { buttons, wait };
};

const latchTouchPad = (raw: PadState, republish: () => void): PadState => {
  stopLatchTimer();
  const { buttons, wait } = holdOpen(raw, performance.now());
  if (wait > 0) TOUCH_LATCH.timer = setTimeout(() => { TOUCH_LATCH.timer = null; republish(); }, wait);
  return { buttons, axes: raw.axes };
};

export { latchTouchPad };
