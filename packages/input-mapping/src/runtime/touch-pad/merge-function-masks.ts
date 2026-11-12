/* @layer shared-input @kind logic */
import type { FunctionMask } from '../../scheme/function-mask';

/** Two readings of the same frame combined: anything either one presses is pressed. */
const mergeFunctionMasks = (a: FunctionMask, b: FunctionMask): FunctionMask => ({
  dpad: a.dpad | b.dpad,
  pause: a.pause || b.pause,
  map: a.map || b.map,
  menu: {
    confirm: a.menu.confirm || b.menu.confirm,
    cancel: a.menu.cancel || b.menu.cancel,
    prevScreen: a.menu.prevScreen || b.menu.prevScreen,
    nextScreen: a.menu.nextScreen || b.menu.nextScreen,
  },
  slots: [...new Set([...a.slots, ...b.slots])],
});

export { mergeFunctionMasks };
