/* @layer shared-input @kind logic */
import { DEFAULT_AXIS_THRESHOLD, DEFAULT_TRIGGER_THRESHOLD, TRIGGER_AXES } from './binding-pressed.constants';
import type { InputBinding } from '../../types/controls/bindings';
import type { InputSample } from './binding-pressed.type';

const thresholdFor = (axisIndex: number, sample: InputSample): number => {
  if (TRIGGER_AXES.includes(axisIndex)) return sample.triggerThreshold ?? DEFAULT_TRIGGER_THRESHOLD;
  return sample.axisThreshold ?? DEFAULT_AXIS_THRESHOLD;
};

const axisDown = (value: number, direction: '+' | '-', threshold: number): boolean => {
  return direction === '+' ? value >= threshold : value <= -threshold;
};

const isBindingDown = (binding: InputBinding, sample: InputSample): boolean => {
  switch (binding.type) {
    case 'keyboard':
      return sample.keys.has(binding.code);
    case 'gamepad-button':
      return sample.pads.some(pad => pad.buttons[binding.index] === true);
    case 'gamepad-axis': {
      const threshold = thresholdFor(binding.axisIndex, sample);
      return sample.pads.some(pad => axisDown(pad.axes[binding.axisIndex] ?? 0, binding.direction, threshold));
    }
    default:
      return false;
  }
};

export { isBindingDown };
