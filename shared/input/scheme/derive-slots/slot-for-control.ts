/* @layer shared-input @kind logic */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import { RESERVED_CATEGORY } from './derive-slots.constants';
import type { ResolvedControl } from '../../family/family.type';
import type { InputBinding, ModernSlot } from '@rotp/game-data';

const pressableBinding = (control: ResolvedControl): InputBinding | null => {
  if (control.kind === 'button') {
    const index = SDL_BUTTON[control.position as keyof typeof SDL_BUTTON];
    return index === undefined ? null : { type: 'gamepad-button', index, label: control.label };
  }
  const axisIndex = SDL_AXIS[control.position as keyof typeof SDL_AXIS];
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
