/* @layer shared-input @kind logic */
/**
 * Which slots a MENU VERB is sitting on top of.
 *
 * Contract §11 deliberately lets a menu verb and a gameplay slot share one
 * physical button, because confirm on the same button as the action is what a player
 * expects, and claiming the four menu verbs would cost a default pad its two
 * most natural face buttons. The cost of that sharing is this fact: while the
 * menu is open, one press is readable as two things at once, and the menu's
 * event reader has to be told which slots are in that position or it will
 * assign whatever the cursor is on every time the player changes screen.
 *
 * The fact lives here because only the BINDINGS know it. A `FunctionMask` says
 * "confirm is down" and "slot 4 is down" but not that they are the same
 * key; `menuEdges` therefore cannot work it out from what it is handed. The
 * rule that acts on it (menu verb wins) is the open menu's, and stays there.
 *
 * WHICH VERBS SHADOW. Every verb the open menu actually consumes: the four
 * directions (they move the cursor), pause (it closes the menu) and the four
 * menu verbs. NOT `map`, because nothing in the menu reads it, so a slot sharing the
 * map button is free to assign there and suppressing it would silently drop a
 * press the player meant.
 *
 * Sameness is "would both read down off the same physical control", asked
 * exactly the way `isBindingDown` asks it: a key by its code (modifiers are not
 * consulted there either), a pad button by its index, an axis by its index and
 * direction. An unbound verb shadows nothing.
 */
import type { CoreBindings, InputBinding, ModernBindings, SlotIndex } from '../../types/controls';

/** The verbs an OPEN menu turns into events. The header says why `map` is absent. */
const MENU_CONSUMED_VERBS: readonly (keyof CoreBindings)[] = [
  'up', 'down', 'left', 'right', 'pause', 'confirm', 'cancel', 'prevScreen', 'nextScreen',
];

const sameControl = (a: InputBinding, b: InputBinding): boolean => {
  if (a.type !== b.type) return false;
  if (a.type === 'keyboard' && b.type === 'keyboard') return a.code === b.code;
  if (a.type === 'gamepad-button' && b.type === 'gamepad-button') return a.index === b.index;
  if (a.type === 'gamepad-axis' && b.type === 'gamepad-axis') {
    return a.axisIndex === b.axisIndex && a.direction === b.direction;
  }
  return false;
};

/** The NUMBERS of the slots that share a physical control with a verb the menu consumes. */
const menuShadowedSlots = (bindings: ModernBindings): Set<SlotIndex> => {
  const verbs = MENU_CONSUMED_VERBS.map(verb => bindings.core[verb]);
  const shadowed = new Set<SlotIndex>();
  for (const slot of bindings.slots) {
    if (verbs.some(verb => sameControl(verb, slot.binding))) shadowed.add(slot.index);
  }
  return shadowed;
};

export { MENU_CONSUMED_VERBS, menuShadowedSlots, sameControl };
