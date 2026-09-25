/* @layer shared-input @kind logic */
/**
 * The slot list a device STARTS with. It is the prefill written when a controller is
 * dropped onto a scheme, and nothing more.
 *
 * THERE IS NO LONGER A CAP, AND NO CATEGORY FILTER. `ASSIGNABLE_CATEGORIES` is
 * gone with contract §15: every pressable control on any device can back a
 * slot, so a thirty-button pad prefills thirty and a keyboard prefills every
 * free preset key. The old rule of face buttons and d-pad directions only was
 * what made a large device impossible to use, and it existed to keep the
 * position-derived slot ids of §11 tractable. Numbered slots need neither.
 *
 * DROPPING A PAD PREFILLS, IT DOES NOT CONSTRAIN. What comes out of here is
 * written to the profile once and is then the player's list: they add, remove
 * and re-bind it freely (see `slot-list.ts`), and nothing re-derives it behind
 * them. That is the reversal of the old "derived on every read" rule, and it is
 * what makes the list open-ended, because a list recomputed from the device can only
 * ever be as long as the device.
 *
 * TWO SUBTRACTIONS SURVIVE, and only for the prefill:
 *  - The GAMEPLAY verbs' positions. Movement, pause and map are live while the
 *    player is playing, so a slot sharing one of those buttons would fire both
 *    at once. The four MENU verbs claim nothing (contract §11): they answer
 *    only while the menu is open, and `menu-shadowed-slots.ts` suppresses the
 *    slot press underneath them, so confirm sits on the same button as the
 *    action exactly as a player expects.
 *  - 'system' buttons (Start, Back, Guide, Touchpad, the MISC buttons). Those are the
 *    host's own, and they are what pause and map are already bound to.
 *
 * Both are defaults, not laws. A player who wants a slot on Start adds one and
 * binds it; nothing here objects, and the controls screen is where they see the
 * clash they made.
 */
import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import { corePositions } from './core-positions';
import { inPrefillOrder } from './prefill-order';
import { renumberSlots } from './slot-list';
import type { ResolvedControl } from '../family/family.type';
import type { CoreBindings, InputBinding, ModernSlot } from '../../types/controls';

/** The host's own buttons, and the only category that is never prefilled. */
const RESERVED_CATEGORY = 'system';

/** Buttons read as buttons; a trigger reported as an axis reads as a deflection
 *  of that axis. Both are one physical control the player can press, which is
 *  the only test now that the category cap is gone. */
const bindingFor = (control: ResolvedControl): InputBinding | null => {
  if (control.kind === 'button') {
    const index = SDL_BUTTON[control.position as keyof typeof SDL_BUTTON];
    return index === undefined ? null : { type: 'gamepad-button', index, label: control.label };
  }
  const axisIndex = SDL_AXIS[control.position as keyof typeof SDL_AXIS];
  if (axisIndex === undefined || control.category !== 'trigger') return null;
  return { type: 'gamepad-axis', axisIndex, direction: '+', label: control.label };
};

/** One control as an unnumbered slot, or null when it cannot back one at all. */
const slotForControl = (control: ResolvedControl): Omit<ModernSlot, 'index'> | null => {
  if (control.category === RESERVED_CATEGORY) return null;
  const binding = bindingFor(control);
  if (!binding) return null;
  return {
    binding,
    position: control.position,
    label: control.label,
    icon: control.icon ? { key: control.icon, path: null, label: control.label } : null,
  };
};

/**
 * Every control this device could back a slot with, in the device's own order
 * and already numbered. The inventory, before any core is subtracted from it.
 */
const deviceSlots = (controls: readonly ResolvedControl[]): ModernSlot[] => {
  const slots: Omit<ModernSlot, 'index'>[] = [];
  for (const control of controls) {
    const slot = slotForControl(control);
    if (slot) slots.push(slot);
  }
  return renumberSlots(slots.map((slot) => ({ ...slot, index: 0 }))).slots;
};

/**
 * The list a freshly dropped controller gets: everything it reports, minus the
 * positions the gameplay verbs already answer to, numbered 1..N.
 *
 * Written once. Every reader afterwards reads the stored list.
 */
const defaultSlotList = (controls: readonly ResolvedControl[], core: CoreBindings): ModernSlot[] => {
  const claimed = corePositions(core);
  const free = deviceSlots(controls).filter((slot) => !slot.position || !claimed.has(slot.position));
  return renumberSlots(inPrefillOrder(free)).slots;
};

export { defaultSlotList, deviceSlots };
