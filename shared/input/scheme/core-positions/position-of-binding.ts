/* @layer shared-input @kind logic */
import { AXIS_BY_INDEX, BUTTON_BY_INDEX, TRIGGER_AXIS_NAMES } from './core-positions.constants';
import type { InputBinding } from '../../../types/controls';
import type { SdlPosition } from './core-positions.type';

const positionOfBinding = (binding: InputBinding): SdlPosition | null => {
  if (binding.type === 'gamepad-button') return BUTTON_BY_INDEX.get(binding.index) ?? null;
  if (binding.type === 'gamepad-axis') {
    const axis = AXIS_BY_INDEX.get(binding.axisIndex);
    return axis && TRIGGER_AXIS_NAMES.includes(axis) ? axis : null;
  }
  return null;
};

export { positionOfBinding };
