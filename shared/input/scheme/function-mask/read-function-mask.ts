/* @layer shared-input @kind logic */
import { isBindingDown } from '../binding-pressed';
import { DIRECTION_BIT } from './function-mask.constants';
import type { InputSample } from '../binding-pressed.type';
import type { CoreBindings, ModernBindings } from '../../../types/controls/scheme';
import type { FunctionMask } from './function-mask.type';

const readDpad = (core: CoreBindings, sample: InputSample): number => {
  let bits = 0;
  if (isBindingDown(core.up, sample)) bits |= DIRECTION_BIT.up;
  if (isBindingDown(core.down, sample)) bits |= DIRECTION_BIT.down;
  if (isBindingDown(core.left, sample)) bits |= DIRECTION_BIT.left;
  if (isBindingDown(core.right, sample)) bits |= DIRECTION_BIT.right;
  return bits;
};

const readFunctionMask = (sample: InputSample, bindings: ModernBindings): FunctionMask => {
  const { core, slots } = bindings;
  return {
    dpad: readDpad(core, sample),
    pause: isBindingDown(core.pause, sample),
    map: isBindingDown(core.map, sample),
    menu: {
      confirm: isBindingDown(core.confirm, sample),
      cancel: isBindingDown(core.cancel, sample),
      prevScreen: isBindingDown(core.prevScreen, sample),
      nextScreen: isBindingDown(core.nextScreen, sample),
    },
    slots: slots.filter(slot => isBindingDown(slot.binding, sample)).map(slot => slot.index),
  };
};

export { readFunctionMask };
