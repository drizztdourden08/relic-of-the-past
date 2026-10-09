/* @layer renderer-lib @kind logic */
import type { InputBinding, ButtonIcon } from '@rotp/game-data';
import { formatKeyBinding } from './format-key-binding';

const getBindingLabel = (binding: InputBinding, icon?: ButtonIcon | null): string => {
  if (binding.type === 'none') return '-';
  if (icon?.label) return icon.label;
  switch (binding.type) {
    case 'keyboard':
      return formatKeyBinding(binding);
    case 'gamepad-button':
      return binding.label ?? `Button ${binding.index}`;
    case 'gamepad-axis':
      return binding.label ?? `Axis ${binding.axisIndex}${binding.direction}`;
  }
};

export { getBindingLabel };
