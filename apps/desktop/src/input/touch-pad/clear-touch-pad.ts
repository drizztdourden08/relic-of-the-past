/* @layer renderer-lib @kind logic */
import { TOUCH_PAD_KEY } from '@rotp/input-mapping';
import { peekInputManager } from '../input-manager/peek-input-manager';

const clearTouchPad = (): void => {
  peekInputManager()?.hidStates.delete(TOUCH_PAD_KEY);
};

export { clearTouchPad };
