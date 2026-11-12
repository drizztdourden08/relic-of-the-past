/* @layer renderer-lib @kind logic */
import { TOUCH_PAD_KEY } from '@rotp/input-mapping';
import { peekInputManager } from '../input-manager/peek-input-manager';
import { resetTouchPadLatch } from './reset-touch-pad-latch';

const clearTouchPad = (): void => {
  resetTouchPadLatch();
  peekInputManager()?.hidStates.delete(TOUCH_PAD_KEY);
};

export { clearTouchPad };
