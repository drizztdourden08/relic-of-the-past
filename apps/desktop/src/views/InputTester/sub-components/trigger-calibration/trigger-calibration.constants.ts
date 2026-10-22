/* @layer renderer-components @kind constants */
import type { CalibrationStepDef } from '../calibration-parts';
import type { Step } from './trigger-calibration.type';

const REST_SAMPLE_FRAMES = 60;
const DEFAULT_DEADZONE = 0.05;
const MIN_TRIGGER_RANGE = 0.1;
const FULL_PRESS_HIGHLIGHT = 0.9;
const LEFT_TRIGGER_AXIS = 4;
const RIGHT_TRIGGER_AXIS = 5;
const LEFT_TRIGGER_BYTE = 61;
const RIGHT_TRIGGER_BYTE = 62;

const TRIGGER_STEPS: readonly CalibrationStepDef<Step>[] = [
  { key: 'rest', label: 'Rest' },
  { key: 'max', label: 'Max' },
  { key: 'review', label: 'Review' },
];

export {
  DEFAULT_DEADZONE, FULL_PRESS_HIGHLIGHT, LEFT_TRIGGER_AXIS, LEFT_TRIGGER_BYTE,
  MIN_TRIGGER_RANGE, REST_SAMPLE_FRAMES, RIGHT_TRIGGER_AXIS, RIGHT_TRIGGER_BYTE, TRIGGER_STEPS,
};
