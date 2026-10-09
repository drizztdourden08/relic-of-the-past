/* @layer renderer-hud @kind constants */
const GEAR_BOX_COLS = 19;

const TIER_SIZE = 16;
const TIER_PITCH = 24;

const ROW_PITCH = 24;

const LABEL_W = 40;
const LABEL_GLYPH = 6;

const BOX_FRAME = 16;
const TILE = 8;

const HERO_X = 176;
const HERO_COLUMN_W = 96;
const HERO_Y = 4;

const HERO_ZOOM = 3;

const HINT_GLYPH = 6;

const PASSIVE_SECTION = 'passive' as const;

export {
  BOX_FRAME, GEAR_BOX_COLS, HERO_COLUMN_W, HERO_X, HERO_Y, HERO_ZOOM, HINT_GLYPH,
  LABEL_GLYPH, LABEL_W, PASSIVE_SECTION, ROW_PITCH, TIER_PITCH, TIER_SIZE, TILE,
};
