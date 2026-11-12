/* @layer shared-input @kind logic */
import { readFunctionMask } from '../../scheme/function-mask/read-function-mask';
import type { FunctionMask } from '../../scheme/function-mask';
import { STICK_DIRECTION_PRESS_THRESHOLD } from '../axis-press-threshold';
import type { HidDeviceState } from '../polling-engine.type';
import { touchModernBindings } from './touch-bindings';
import { NO_KEYS } from './touch-function-mask.constants';

const touchFunctionMask = (pad: HidDeviceState): FunctionMask =>
  readFunctionMask(
    { keys: NO_KEYS, pads: [pad], axisThreshold: STICK_DIRECTION_PRESS_THRESHOLD, triggerThreshold: STICK_DIRECTION_PRESS_THRESHOLD },
    touchModernBindings(),
  );

export { touchFunctionMask };
