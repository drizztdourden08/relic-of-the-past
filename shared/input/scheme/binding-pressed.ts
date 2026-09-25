/* @layer shared-input @kind logic */
/**
 * Is this one binding down, given a raw sample of the machine's input?
 *
 * The pure half of what the renderer's polling engine does per frame. It
 * takes the raw state as a parameter instead of reaching for a store, a
 * device registry or the DOM, so the whole scheme layer stays testable and
 * free of app imports. Device scoping is deliberately not modelled here:
 * the caller passes the pads the active profile already allows, and a
 * binding is down when ANY of them has it down.
 *
 * Thresholds mirror the renderer's own axis-press rules: a trigger axis
 * only counts near the end of its travel, any other axis at plain
 * deflection.
 */
import { SDL_AXIS } from '../sdl-buttons';
import type { InputBinding } from '../../types/controls/bindings';

interface GamepadSample {
  readonly buttons: readonly boolean[];
  readonly axes: readonly number[];
}

interface InputSample {
  /** Currently-held KeyboardEvent.code values. */
  readonly keys: ReadonlySet<string>;
  /** Every pad the active profile allows, already normalized by the host. */
  readonly pads: readonly GamepadSample[];
  /** Deflection a non-trigger axis must cross to count as pressed. */
  readonly axisThreshold?: number;
  /** How far a trigger axis must travel before it counts as pressed. */
  readonly triggerThreshold?: number;
}

const DEFAULT_AXIS_THRESHOLD = 0.5;
const DEFAULT_TRIGGER_THRESHOLD = 0.9;

const TRIGGER_AXES: readonly number[] = [SDL_AXIS.LEFT_TRIGGER, SDL_AXIS.RIGHT_TRIGGER];

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

export { DEFAULT_AXIS_THRESHOLD, DEFAULT_TRIGGER_THRESHOLD, isBindingDown };
export type { GamepadSample, InputSample };
