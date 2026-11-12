/* @layer renderer-components @kind constants */
const FADE_IN_PER_SECOND = 4.0;
const FADE_OUT_PER_SECOND = 12.0;
const SCREEN_CROSSING_JUMP_PX = 10;
const TALL_SNES_HEIGHT = 240;
const TALL_SCREEN_BOTTOM_MAX = 16;
// The game draws 60 frames a second, so a faster display (120 Hz phones) gets no new picture from
// the extra refreshes; the glow pass skips any refresh that comes sooner than this after the last one.
const GLOW_MIN_FRAME_MS = 1000 / 60 - 2;

export { FADE_IN_PER_SECOND, FADE_OUT_PER_SECOND, SCREEN_CROSSING_JUMP_PX, TALL_SNES_HEIGHT, TALL_SCREEN_BOTTOM_MAX, GLOW_MIN_FRAME_MS };
