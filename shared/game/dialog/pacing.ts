/* @layer shared-game @kind logic */
/**
 * The dialog pacing ladders. Text speed is a multiplier over the game's own pacing, with 0
 * meaning instant (the ROM's own "Speed 00" convention). The hold ladder is the multiplier
 * applied while A is held, and the font scale ladder sizes the modern font of the enhanced box.
 */

/** Text speed stops, slowest first; 0 is instant and sits at the end. Below 1 only slows typed lines. */
const DIALOG_SPEED_STOPS = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 0] as const;

/** Multipliers the hold-to-accelerate slider can pick. */
const DIALOG_HOLD_STOPS = [1.5, 2, 2.5, 3, 4] as const;

/** Sizes the modern dialog font can take, as a multiple of the game's glyph height. */
const DIALOG_FONT_SCALES = [1, 1.25, 1.5, 2] as const;

/** Outline thickness around a modern glyph, in game pixels; 0 draws no outline. */
const DIALOG_STROKE_WIDTHS = [0, 0.5, 1, 1.5, 2] as const;

type DialogSpeedStop = (typeof DIALOG_SPEED_STOPS)[number];
type DialogHoldStop = (typeof DIALOG_HOLD_STOPS)[number];
type DialogFontScale = (typeof DIALOG_FONT_SCALES)[number];
type DialogStrokeWidth = (typeof DIALOG_STROKE_WIDTHS)[number];

/** 1/4-tick fixed point for the core: 1 becomes 4, 1.5 becomes 6, 4 becomes 16, instant stays 0. */
const toQ4 = (stop: number): number => Math.round(stop * 4);

/** The index of the stop closest to a stored value, so an odd value still lands on the ladder. */
const nearestStopIndex = (stops: readonly number[], value: number): number => {
  let best = 0;
  for (let i = 1; i < stops.length; i++) {
    if (Math.abs(stops[i] - value) < Math.abs(stops[best] - value)) best = i;
  }
  return best;
};

/** Display form of a speed stop: the game's own pacing, instant, or a multiplier. */
const formatDialogSpeed = (stop: number): string => {
  if (stop === 0) return 'Instant';
  if (stop === 1) return 'Original';
  return `${stop}x`;
};

export { DIALOG_SPEED_STOPS, DIALOG_HOLD_STOPS, DIALOG_FONT_SCALES, DIALOG_STROKE_WIDTHS, toQ4, nearestStopIndex, formatDialogSpeed };
export type { DialogSpeedStop, DialogHoldStop, DialogFontScale, DialogStrokeWidth };
