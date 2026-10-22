/* @layer renderer-components @kind constants */
import type { CalibrationStepDef } from '../calibration-parts';
import type { Step, StickCalibration, StickQuad, StickRangeBounds } from './stick-calibration.type';

const CENTER_SAMPLE_FRAMES = 60;
const DEFAULT_INNER_DEADZONE = 0.10;
const DEFAULT_OUTER_DEADZONE = 0.95;
const STICK_RAW_CENTER = 2048;
const STICK_RAW_MAX = 4095;
const MIN_STICK_RANGE = 500;
const STICK_CIRCLE_SIZE = 100;
const STICK_CIRCLE_LARGE_SIZE = 120;
const STICK_CIRCLE_INSET = 12;

const STICK_STEPS: readonly CalibrationStepDef<Step>[] = [
  { key: 'center', label: 'Center' },
  { key: 'range', label: 'Range' },
  { key: 'review', label: 'Review' },
];

const STICK_CENTERED: StickQuad = { lx: STICK_RAW_CENTER, ly: STICK_RAW_CENTER, rx: STICK_RAW_CENTER, ry: STICK_RAW_CENTER };

const STICK_RANGE_EMPTY: StickRangeBounds = {
  lxMin: STICK_RAW_MAX, lxMax: 0, lyMin: STICK_RAW_MAX, lyMax: 0,
  rxMin: STICK_RAW_MAX, rxMax: 0, ryMin: STICK_RAW_MAX, ryMax: 0,
};

const DEFAULT_STICK: StickCalibration = {
  centerX: STICK_RAW_CENTER, centerY: STICK_RAW_CENTER, minX: 0, maxX: STICK_RAW_MAX, minY: 0, maxY: STICK_RAW_MAX,
  innerDeadzone: DEFAULT_INNER_DEADZONE, outerDeadzone: DEFAULT_OUTER_DEADZONE,
};

export {
  CENTER_SAMPLE_FRAMES, DEFAULT_INNER_DEADZONE, DEFAULT_OUTER_DEADZONE, DEFAULT_STICK, MIN_STICK_RANGE,
  STICK_CENTERED, STICK_CIRCLE_INSET, STICK_CIRCLE_LARGE_SIZE, STICK_CIRCLE_SIZE, STICK_RANGE_EMPTY, STICK_RAW_CENTER,
  STICK_STEPS,
};
