/* @layer renderer-hud @kind constants */
/** The pixel pie's grid, palette and motion. Lengths are game pixels: one grid cell is one game pixel. */

/** Side of the square grid. Even, so the pie's centre sits on a pixel corner and the grid centres on the frame. */
const GRID_SIZE = 44;
/** Whole pixels a leaving slice travels before it is gone. The grid keeps this much room around the disc. */
const MAX_PUSH = 4;
/** Width of the ring around the slices: one pixel of backing, then the one pixel outline. */
const RING_WIDTH = 2;
/** Radius of the hub the digits sit on. Slice cells inside it take the deep colour, so the digits stay readable. */
const HUB_RADIUS = 10;
/** Width of the shaded band on the lower right of the slices. */
const RIM_WIDTH = 2;
/** Empty pixels between the grid edge and the disc outline. */
const DISC_INSET = MAX_PUSH;

/** Palette indices a grid cell can hold. */
const INK = { clear: 0, outline: 1, backing: 2, deep: 3, shade: 4, lit: 5, bright: 6 } as const;
/** Body colour of the next slice to leave, one entry per pulse step. */
const PULSE_LEVELS: readonly number[] = [INK.bright, INK.lit, INK.shade, INK.lit];

/** Steps a leaving slice takes. Each one moves it a pixel outward and thins it by a quarter. */
const EXIT_STEPS = 4;
/** Length of one motion step in milliseconds, about eight game frames. Four of them match the smooth pie's exit. */
const STEP_MS = 125;
/** Motion steps one pulse step lasts. */
const PULSE_STEP_TICKS = 4;

/** Ordered 2x2 dither. A cell is kept while its value is under the number of quarters still drawn. */
const DITHER: readonly (readonly number[])[] = [[0, 2], [3, 1]];

export {
  GRID_SIZE, MAX_PUSH, RING_WIDTH, HUB_RADIUS, RIM_WIDTH, DISC_INSET,
  INK, PULSE_LEVELS, EXIT_STEPS, STEP_MS, PULSE_STEP_TICKS, DITHER,
};
