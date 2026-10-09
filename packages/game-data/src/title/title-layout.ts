/* @layer shared-game @kind data */
const FRAME_W = 256;
const FRAME_H = 224;

const LOGO_AT = { x: 50, y: 65 } as const;

const SWORD_X = 56;
const SWORD_TOP_FOR_BASE = 8;
const SWORD_REST_BASE = 30;

const HILT_SPARKLE_AT = { x: 0x44, y: 0x43 } as const;
const GLINT_X = 0x42;
const GLINT_TOP_OFFSET = 0x31;
const GLINT_RUN_MAX = 0x4f;

const PIECE_SIZE = 64;
const MIRRORED_PIECE = 2;

const HORIZON_Y = 120;
const CASTLE_TOP = 33;

const COPYRIGHT_AT = { x: 76, y: 184 } as const;

const LOGO_BARS_OVER_BLADE = [
  { x: 16, y: 14, w: 11, h: 10 },
  { x: 16, y: 70, w: 11, h: 10 },
] as const;

const PROMPT_START_Y = 184;
const PROMPT_STORY_Y = 200;
const PROMPT_START_H = 10;
const PROMPT_STORY_H = 6;

export {
  CASTLE_TOP, COPYRIGHT_AT, FRAME_H, FRAME_W, GLINT_RUN_MAX, GLINT_TOP_OFFSET, GLINT_X, HILT_SPARKLE_AT,
  HORIZON_Y, LOGO_AT, LOGO_BARS_OVER_BLADE, MIRRORED_PIECE, PIECE_SIZE, PROMPT_START_H, PROMPT_START_Y,
  PROMPT_STORY_H, PROMPT_STORY_Y, SWORD_REST_BASE, SWORD_TOP_FOR_BASE, SWORD_X,
};
