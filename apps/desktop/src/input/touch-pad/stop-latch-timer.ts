/* @layer renderer-lib @kind logic */
import { TOUCH_LATCH } from './touch-pad-latch.constants';

const stopLatchTimer = (): void => {
  if (TOUCH_LATCH.timer !== null) clearTimeout(TOUCH_LATCH.timer);
  TOUCH_LATCH.timer = null;
};

export { stopLatchTimer };
