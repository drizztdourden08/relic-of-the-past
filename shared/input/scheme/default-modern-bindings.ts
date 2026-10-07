/* @layer shared-input @kind logic */
/**
 * The modern scheme a device starts with, before the player changes
 * anything.
 *
 * Gamepad: the ten core verbs sit where a player of any modern console
 * already expects them, with MOVEMENT ON THE LEFT STICK, pause on START, map on
 * BACK, and the menu verbs on the positions a system menu uses. A verb whose
 * position this particular pad does not report stays unbound instead of
 * being moved somewhere surprising. Everything left over becomes a slot, in
 * the device's own order.
 *
 * MOVEMENT IS ON THE STICK AND NOWHERE ELSE HERE, and that is a deliberate
 * asymmetry with the classic defaults, which bind the stick AND the d-pad
 * (build-console-defaults.ts). Under classic, a second movement binding costs
 * nothing: there are no slots, so the d-pad is otherwise idle. Under modern the
 * prefill skips whatever a gameplay verb already answers to, so binding
 * movement to the d-pad as well would spend four prefilled slots duplicating
 * something the stick already does. The stick claims no position at all (see
 * core-positions.ts), which is what leaves the d-pad in the list.
 *
 * A player who wants the d-pad to move them rebinds a direction onto it and
 * removes the slots they no longer want; the list is theirs to edit (§19). The
 * default just does not make that choice for them.
 *
 * WHERE THE MENU VERBS LAND. Prev/next screen are on the two shoulders, which
 * is what a player expects of a tabbed menu. Confirm and cancel stay on EAST
 * and SOUTH, sharing with two prefilled slots, and that is deliberate because confirm
 * belongs on the same button as the action, and the menu shadows the slot
 * underneath it while it is open. The default pad therefore double-books
 * exactly two buttons and only while the menu is up.
 *
 * Keyboard: SDL never enumerates a keyboard, so there is no resolved
 * control list to derive from. The existing keyboard preset is the source
 * instead: each core verb takes the key already bound to the console button
 * that verb corresponds to, and every remaining preset key becomes a slot.
 */
import { GAMEPLAY_VERBS } from './core-positions';
import { KEYBOARD_DEFAULT } from '../keyboard-default';
import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import { defaultSlotList } from './derive-slots';
import { renumberSlots } from './slot-list';
import type { ResolvedControl } from '../family/family.type';
import type { SdlAxisName, SdlButtonName } from '../sdl-buttons';
import type { SnesButton } from '../../types/controls/snes';
import type { CoreBindings, InputBinding, ModernBindings, ModernSlot } from '../../types/controls';

type CoreVerb = keyof CoreBindings;

const UNBOUND: InputBinding = { type: 'none' };

/** One half of a stick, for a verb that defaults to an axis instead of to a
 *  button. SDL's Y axis points down, so '-' is up and '+' is down. */
interface AxisPosition {
  readonly axis: SdlAxisName;
  readonly direction: '+' | '-';
}

type CorePosition = SdlButtonName | AxisPosition;

const isAxisPosition = (position: CorePosition): position is AxisPosition =>
  typeof position !== 'string';

/** Where each verb sits on a pad that reports the position at all. */
const DEFAULT_CORE_POSITIONS: Record<CoreVerb, CorePosition> = {
  up: { axis: 'LEFT_Y', direction: '-' },
  down: { axis: 'LEFT_Y', direction: '+' },
  left: { axis: 'LEFT_X', direction: '-' },
  right: { axis: 'LEFT_X', direction: '+' },
  pause: 'START',
  map: 'BACK',
  confirm: 'EAST',
  cancel: 'SOUTH',
  prevScreen: 'LEFT_SHOULDER',
  nextScreen: 'RIGHT_SHOULDER',
};

/** Which console button each verb inherits its key from on the keyboard. */
const KEYBOARD_CORE_SOURCE: Record<CoreVerb, SnesButton> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  pause: 'Start',
  map: 'X',
  confirm: 'A',
  cancel: 'B',
  prevScreen: 'L',
  nextScreen: 'R',
};

const CORE_VERBS = Object.keys(DEFAULT_CORE_POSITIONS) as CoreVerb[];

const buildCore = (bindingFor: (verb: CoreVerb) => InputBinding): CoreBindings => {
  const core = {} as CoreBindings;
  for (const verb of CORE_VERBS) core[verb] = bindingFor(verb);
  return core;
};

/** The binding for one default position, or UNBOUND when this pad does not
 *  report the control it names. The `kind` test on both branches is what
 *  keeps a device whose family describes a position as the other shape from
 *  producing a binding the poll loop would read off the wrong array. */
const bindingForPosition = (position: CorePosition, byPosition: Map<string, ResolvedControl>): InputBinding => {
  if (isAxisPosition(position)) {
    const control = byPosition.get(position.axis);
    if (!control || control.kind !== 'axis') return UNBOUND;
    // The axis' own label names the whole axis, so up and down would read
    // identically in a binding row without the sign. Same "<label> <sign>"
    // shape the saved-binding icon lookup already produces.
    const label = `${control.label} ${position.direction === '+' ? '+' : '−'}`;
    return { type: 'gamepad-axis', axisIndex: SDL_AXIS[position.axis], direction: position.direction, label };
  }
  const control = byPosition.get(position);
  if (!control || control.kind !== 'button') return UNBOUND;
  return { type: 'gamepad-button', index: SDL_BUTTON[control.position as keyof typeof SDL_BUTTON], label: control.label };
};

const defaultCoreBindings = (controls: readonly ResolvedControl[]): CoreBindings => {
  const byPosition = new Map<string, ResolvedControl>(controls.map(control => [control.position, control]));
  return buildCore(verb => bindingForPosition(DEFAULT_CORE_POSITIONS[verb], byPosition));
};

const defaultModernBindings = (controls: readonly ResolvedControl[]): ModernBindings => {
  const core = defaultCoreBindings(controls);
  return { core, slots: defaultSlotList(controls, core) };
};

const keyboardBindingFor = (snesButton: SnesButton): InputBinding => {
  return KEYBOARD_DEFAULT.defaultMappings.find(mapping => mapping.snesButton === snesButton)?.binding ?? UNBOUND;
};

/**
 * Keyboard slots carry no SDL position (there is none), so the cluster draws
 * them from their BINDING (a key cap) instead of from pad artwork.
 *
 * EVERY free preset key becomes a slot, and always did: a keyboard has no face
 * buttons to count and capping it at four would be inventing a limit its
 * hardware does not have. What changed is that this is no longer a special case
 * pleading its way past a category filter. §15 filed every keyboard slot under
 * 'face' purely to get it through the assignable-category test. There is no
 * filter and no cap now (§19), so a keyboard is a device with a great
 * many controls, exactly like a thirty-button pad.
 *
 * Numbered in preset order, 1..N. Only the six GAMEPLAY verbs take a key out of
 * circulation; the four menu verbs answer solely while the menu is open, so
 * they share.
 */
const keyboardSlots = (): ModernSlot[] => {
  const claimed = new Set<SnesButton>(GAMEPLAY_VERBS.map(verb => KEYBOARD_CORE_SOURCE[verb]));
  const free = KEYBOARD_DEFAULT.defaultMappings.filter(mapping => !claimed.has(mapping.snesButton));
  return renumberSlots(free.map((mapping, position) => ({
    index: position + 1,
    binding: mapping.binding,
    label: (mapping.binding.type === 'keyboard' ? mapping.binding.label : undefined) ?? mapping.snesButton,
    icon: mapping.icon,
  }))).slots;
};

const keyboardModernBindings = (): ModernBindings => {
  return {
    core: buildCore(verb => keyboardBindingFor(KEYBOARD_CORE_SOURCE[verb])),
    slots: keyboardSlots(),
  };
};

export {
  DEFAULT_CORE_POSITIONS,
  KEYBOARD_CORE_SOURCE,
  defaultCoreBindings,
  defaultModernBindings,
  keyboardModernBindings,
};
export type { CorePosition, CoreVerb };
