/* @layer shared-game @kind types */
import type { DIALOG_FONT_SCALES, DIALOG_HOLD_STOPS, DIALOG_SPEED_STOPS, DIALOG_STROKE_WIDTHS } from './pacing.constants';

type DialogSpeedStop = (typeof DIALOG_SPEED_STOPS)[number];
type DialogHoldStop = (typeof DIALOG_HOLD_STOPS)[number];
type DialogFontScale = (typeof DIALOG_FONT_SCALES)[number];
type DialogStrokeWidth = (typeof DIALOG_STROKE_WIDTHS)[number];

export type { DialogFontScale, DialogHoldStop, DialogSpeedStop, DialogStrokeWidth };
