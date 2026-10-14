/* @layer shared-input @kind logic */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import { RESERVED_CATEGORY } from './derive-slots.constants';
import { sdlIndexOf } from './sdl-index-of';
import type { ResolvedControl } from '../../family/family.type';
import type { InputBinding, ModernSlot } from '@rotp/game-data';

const pressableBinding = (control: ResolvedControl): InputBinding | null => {
  if (control.kind === 'button') {
    const index = sdlIndexOf(SDL_BUTTON, control.position);
    return index === undefined ? null : { type: 'gamepad-button', index, label: control.label };
  }
  const axisIndex = sdlIndexOf(SDL_AXIS, control.position);
  if (axisIndex === undefined || control.category !== 'trigger') return null;
  return { type: 'gamepad-axis', axisIndex, direction: '+', label: control.label };
};

const slotForControl = (control: ResolvedControl): Omit<ModernSlot, 'index'> | null => {
  if (control.category === RESERVED_CATEGORY) return null;
  const binding = pressableBinding(control);
  if (!binding) return null;
  return {
    binding,
    position: control.position,
    label: control.label,
    icon: control.icon ? { key: control.icon, path: null, label: control.label } : null,
  };
};

export { slotForControl };
