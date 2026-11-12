/* @layer renderer-lib @kind logic */
import { stopLatchTimer } from './stop-latch-timer';
import { TOUCH_LATCH } from './touch-pad-latch.constants';

const resetTouchPadLatch = (): void => {
  stopLatchTimer();
  TOUCH_LATCH.pressedAt.clear();
};

export { resetTouchPadLatch };
