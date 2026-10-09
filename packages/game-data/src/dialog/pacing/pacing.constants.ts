/* @layer shared-game @kind constants */
const DIALOG_SPEED_STOPS = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 0] as const;
const DIALOG_HOLD_STOPS = [1.5, 2, 2.5, 3, 4] as const;
const DIALOG_FONT_SCALES = [1, 1.25, 1.5, 2] as const;
const DIALOG_STROKE_WIDTHS = [0, 0.5, 1, 1.5, 2] as const;
const INSTANT_SPEED = 0;
const ORIGINAL_SPEED = 1;
const Q4_STEPS_PER_UNIT = 4;

export {
  DIALOG_FONT_SCALES, DIALOG_HOLD_STOPS, DIALOG_SPEED_STOPS, DIALOG_STROKE_WIDTHS, INSTANT_SPEED, ORIGINAL_SPEED,
  Q4_STEPS_PER_UNIT,
};
