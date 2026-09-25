/* @layer renderer-components @kind logic */
/**
 * Slot-list presentation for the controls screen.
 *
 * Identity is a number now (contract §19) and `slotName` in `@shared/input/scheme`
 * spells it, so the old `slotIdLabel`, which unpicked a position out of a
 * `slot:NORTH` string, has nothing left to unpick and is gone with the ids.
 *
 * What remains is the one thing only this screen can answer: when the player
 * re-binds a slot to a different control, WHICH PICTURE that slot should now
 * wear. `position` and `icon` are display only, so they have to follow the
 * binding or the row keeps drawing the pad artwork for a button that no longer
 * does anything. The live control list is the only place that artwork exists,
 * and only this screen holds it.
 */
import { SDL_BUTTON } from '@shared/input/sdl-buttons';
import type { ResolvedControl } from '@shared/input/family';
import type { InputBinding, ModernSlot } from '@shared/types/controls';

interface SlotDisplay {
  position?: ModernSlot['position'];
  icon?: ModernSlot['icon'];
  label?: string;
}

/** The control a gamepad-button binding names, when this device reports it. */
const controlForBinding = (
  binding: InputBinding,
  controls: readonly ResolvedControl[],
): ResolvedControl | undefined => {
  if (binding.type !== 'gamepad-button') return undefined;
  return controls.find((control) => SDL_BUTTON[control.position as keyof typeof SDL_BUTTON] === binding.index);
};

/**
 * What a re-bound slot should draw.
 *
 * A pad control the device reports brings its own position, artwork and name. A
 * key or a control this pad does not report brings none of the three, and
 * that is deliberate: the glyph chain then draws the BINDING (a key cap, or the
 * generic button art), which is the control the player actually presses. Every
 * row still shows a glyph either way; `binding-display.ts` has no text-only
 * branch for a bound control.
 */
const slotDisplay = (binding: InputBinding, controls: readonly ResolvedControl[]): SlotDisplay => {
  const control = controlForBinding(binding, controls);
  if (!control) return {};
  return {
    position: control.position,
    icon: control.icon ? { key: control.icon, path: null, label: control.label } : null,
    label: control.label,
  };
};

export { slotDisplay };
export type { SlotDisplay };
