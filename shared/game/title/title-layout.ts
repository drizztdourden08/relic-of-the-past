/* @layer shared-game @kind data */
/**
 * Where the title's pieces sit in the 256x224 frame, measured from the ROM with the title extractor
 * (shared/asset-extraction/title-screen) and the intro's own sprite tables (ending.c).
 */

const FRAME_W = 256;
const FRAME_H = 224;

/** The logo's top-left, the BG1 tilemap's drawn extent. */
const LOGO_AT = { x: 50, y: 65 } as const;

/** The sword picture's left edge, and the row its top lands on for a sword base of 0. */
const SWORD_X = 56;
const SWORD_TOP_FOR_BASE = 8;
/** The base the sword comes to rest at. */
const SWORD_REST_BASE = 30;

/** The hilt sparkle sprite, and the glint that runs down the blade (Intro_PeriodicSwordAndIntroFlash). */
const HILT_SPARKLE_AT = { x: 0x44, y: 0x43 } as const;
const GLINT_X = 0x42;
const GLINT_TOP_OFFSET = 0x31;
const GLINT_RUN_MAX = 0x4f;

/** One triangle piece is a 64x64 picture; the third is drawn mirrored. */
const PIECE_SIZE = 64;
const MIRRORED_PIECE = 2;

/** The first of the two water-line rows the trees stand on. */
const HORIZON_Y = 120;
/** The castle's top row; its stone foot stands in the water below the line. */
const CASTLE_TOP = 33;

/** The copyright sprite's spot, kept for a mark of our own in the same place. */
const COPYRIGHT_AT = { x: 76, y: 184 } as const;

/**
 * The blade runs through the logo's first letter: behind its top and bottom bars, in front of the
 * diagonal between them. The two bars, in logo pixels, across the blade's columns.
 */
const LOGO_BARS_OVER_BLADE = [
  { x: 16, y: 14, w: 11, h: 10 },
  { x: 16, y: 70, w: 11, h: 10 },
] as const;

/** Where the prompts sit under the picture: the confirm prompt, and the smaller story prompt below it. */
const PROMPT_START_Y = 184;
const PROMPT_STORY_Y = 200;
const PROMPT_START_H = 10;
const PROMPT_STORY_H = 6;

export {
  CASTLE_TOP, COPYRIGHT_AT, FRAME_H, FRAME_W, GLINT_RUN_MAX, GLINT_TOP_OFFSET, GLINT_X, HILT_SPARKLE_AT,
  HORIZON_Y, LOGO_AT, LOGO_BARS_OVER_BLADE, MIRRORED_PIECE, PIECE_SIZE, PROMPT_START_H, PROMPT_START_Y,
  PROMPT_STORY_H, PROMPT_STORY_Y, SWORD_REST_BASE, SWORD_TOP_FOR_BASE, SWORD_X,
};
