/* @layer renderer-components @kind logic */
import { SDL_BUTTON } from '@shared/input/sdl-buttons';
import type { ResolvedControl } from '@shared/input/family';
import type { InputBinding } from '@shared/types/controls';
import type { SlotDisplay } from './controls-settings.type';

const controlForBinding = (
  binding: InputBinding,
  controls: readonly ResolvedControl[],
): ResolvedControl | undefined => {
  if (binding.type !== 'gamepad-button') return undefined;
  return controls.find((control) => SDL_BUTTON[control.position as keyof typeof SDL_BUTTON] === binding.index);
};

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
