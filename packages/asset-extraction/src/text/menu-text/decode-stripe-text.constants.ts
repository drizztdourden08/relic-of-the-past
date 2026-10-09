/* @layer shared-asset-extraction @kind constants */
const MENU_TILEMAPS = [0xce7bf, 0xce2a8, 0xce63c, 0xce456];

const STRIPE_END = 0x80;

const CONTROL_FIXED_SOURCE = 0x4000;

const CONTROL_LENGTH_MASK = 0x3fff;

const TILE_INDEX_MASK = 0x3ff;

const FONT_TILE_COUNT = 0x100;

const LOWER_HALF_BIT = 0x10;

const SPACE_TILE = 0xa9;

const MAX_SLUG = 28;

const EXTRA_GLYPH_BASE = 0x76;

const DIGITS = '0123456789';

const EXTRA_GLYPHS: Record<number, string> = {
  0x5f: 'I',
  0x60: 'i',
  0x61: '!',
  ...Object.fromEntries([...DIGITS].map((digit, i) => [EXTRA_GLYPH_BASE + i, digit])),
};

export {
  CONTROL_FIXED_SOURCE, CONTROL_LENGTH_MASK, EXTRA_GLYPHS, FONT_TILE_COUNT, LOWER_HALF_BIT, MAX_SLUG, MENU_TILEMAPS,
  SPACE_TILE, STRIPE_END, TILE_INDEX_MASK,
};
