/* @layer renderer-lib @kind logic */
import { TOUCH_PAD_KEY, toSdlPad } from '@rotp/input-mapping';
import type { PadState } from '@rotp/input-mapping';
import { peekInputManager } from '../input-manager/peek-input-manager';
import { clearTouchPad } from './clear-touch-pad';
import { latchTouchPad } from './latch-touch-pad';
import { touchPadAllowed } from './touch-pad-allowed';

const publishTouchPad = (pad: PadState): void => {
  const manager = peekInputManager();
  if (!manager) return;
  if (!touchPadAllowed()) {
    clearTouchPad();
    return;
  }
  const held = latchTouchPad(pad, () => publishTouchPad(pad));
  manager.hidStates.set(TOUCH_PAD_KEY, toSdlPad(held));
};

export { publishTouchPad };
