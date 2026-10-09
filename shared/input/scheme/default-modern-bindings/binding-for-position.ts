/* @layer shared-input @kind logic */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import { axisEndLabel } from '../../axis-end-label';
import { UNBOUND } from './default-modern-bindings.constants';
import type { ResolvedControl } from '../../family/family.type';
import type { InputBinding } from '@rotp/game-data';
import type { AxisPosition, CorePosition } from './default-modern-bindings.type';

const isAxisPosition = (position: CorePosition): position is AxisPosition =>
  typeof position !== 'string';

const bindingForPosition = (position: CorePosition, byPosition: Map<string, ResolvedControl>): InputBinding => {
  if (isAxisPosition(position)) {
    const control = byPosition.get(position.axis);
    if (!control || control.kind !== 'axis') return UNBOUND;
    const label = axisEndLabel(control.label, position.direction);
    return { type: 'gamepad-axis', axisIndex: SDL_AXIS[position.axis], direction: position.direction, label };
  }
  const control = byPosition.get(position);
  if (!control || control.kind !== 'button') return UNBOUND;
  return { type: 'gamepad-button', index: SDL_BUTTON[control.position as keyof typeof SDL_BUTTON], label: control.label };
};

export { bindingForPosition };
