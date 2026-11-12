/* @layer renderer-lib @kind logic */
import { TOUCH_PAD_KEY } from '@rotp/input-mapping';
import type { InputManager } from '../input-manager/input-manager';

const readTouchPad = (m: InputManager): { buttons: boolean[]; axes: number[] } | undefined => m.hidStates.get(TOUCH_PAD_KEY);

export { readTouchPad };
