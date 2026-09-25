/* @layer shared-input @kind logic */
/**
 * One frame of input, read as FUNCTIONS, not as console buttons.
 *
 * The renderer's polling engine turns a physical state straight into an SNES
 * bitmask, which forces every decision (what is a slot, which slot holds an
 * item, whether the pause menu should see a confirm) to be made after the
 * information needed to make it has already been thrown away. This reads the
 * same physical state one step earlier: directions stay directions, the menu
 * verbs stay themselves, and every non-core control is reported as the slot
 * NUMBER that is down. Turning that into a mask is the remap step's job, and it
 * differs per scheme.
 *
 * Pure by construction, because the raw state arrives as a parameter.
 */
import { SNES_BUTTON_BITS } from '../../types/controls/snes';
import { isBindingDown } from './binding-pressed';
import type { InputSample } from './binding-pressed';
import type { CoreBindings, ModernBindings, SlotIndex } from '../../types/controls/scheme';

interface MenuMask {
  confirm: boolean;
  cancel: boolean;
  prevScreen: boolean;
  nextScreen: boolean;
}

interface FunctionMask {
  /** SNES direction bits only (Up/Down/Left/Right), ready to OR into a mask. */
  dpad: number;
  pause: boolean;
  map: boolean;
  menu: MenuMask;
  /** Every slot down this frame, by NUMBER, in slot order. */
  slots: SlotIndex[];
}

const DIRECTION_BIT = {
  up: 1 << SNES_BUTTON_BITS.Up,
  down: 1 << SNES_BUTTON_BITS.Down,
  left: 1 << SNES_BUTTON_BITS.Left,
  right: 1 << SNES_BUTTON_BITS.Right,
} as const;

const EMPTY_MENU: MenuMask = { confirm: false, cancel: false, prevScreen: false, nextScreen: false };

/** A mask with nothing down, used to seed an edge comparison's first frame. */
const emptyFunctionMask = (): FunctionMask => {
  return { dpad: 0, pause: false, map: false, menu: { ...EMPTY_MENU }, slots: [] };
};

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

export { DIRECTION_BIT, emptyFunctionMask, readFunctionMask };
export type { FunctionMask, MenuMask };
