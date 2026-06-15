/* @layer renderer-components @kind constants */
/**
 * Constants for the HID Calibration Wizard.
 */

const STICK_IDS = new Set(['leftX', 'leftY', 'rightX', 'rightY']);
const TRIGGER_IDS = new Set(['leftTrigger', 'rightTrigger']);

/** Minimum byte delta to consider a change "analog" rather than digital */
const ANALOG_THRESHOLD_DELTA = 30;

const STICK_RANGE_THRESHOLD = 60;
const STICK_STABLE_FRAMES = 8;
const CONFIRM_FRAMES = 5;

const AXIS_LABELS: Record<string, { pos: string; neg: string }> = {
  leftX:  { pos: 'Push LEFT stick fully RIGHT',  neg: 'Push LEFT stick fully LEFT' },
  leftY:  { pos: 'Push LEFT stick fully DOWN',   neg: 'Push LEFT stick fully UP' },
  rightX: { pos: 'Push RIGHT stick fully RIGHT', neg: 'Push RIGHT stick fully LEFT' },
  rightY: { pos: 'Push RIGHT stick fully DOWN',  neg: 'Push RIGHT stick fully UP' },
};

const TRIGGER_RANGE_THRESHOLD = 40;
const TRIGGER_STABLE_FRAMES = 6;

export {
  ANALOG_THRESHOLD_DELTA,
  AXIS_LABELS,
  CONFIRM_FRAMES,
  STICK_IDS,
  STICK_RANGE_THRESHOLD,
  STICK_STABLE_FRAMES,
  TRIGGER_IDS,
  TRIGGER_RANGE_THRESHOLD,
  TRIGGER_STABLE_FRAMES,
};
