/* @layer renderer-hud @kind constants */
/** Slices the countdown pie is cut into. A shorter countdown takes one slice per second. */
const SLICE_COUNT = 10;
/** Diameter of the slices in game pixels: four HUD tiles. */
const PIE_DIAMETER = 32;
/** Rounding slack, so a share that lands on a slice edge does not count one slice too many. */
const SHARE_EPSILON = 1e-9;

export { SLICE_COUNT, PIE_DIAMETER, SHARE_EPSILON };
