/* @layer shared-asset-extraction @kind constants */
const TILE_NUMBER_MASK = 0x3ff;
const PALETTE_SHIFT = 10;
const FLIP_X_BIT = 0x4000;
const FLIP_Y_BIT = 0x8000;
const HUD_TILES_PER_SHEET = 128;
const HUD_TILE_BYTES = 16;
const HUD_SHEET_IDS = [106, 107, 105];

export {
  FLIP_X_BIT, FLIP_Y_BIT, HUD_SHEET_IDS, HUD_TILE_BYTES, HUD_TILES_PER_SHEET, PALETTE_SHIFT, TILE_NUMBER_MASK,
};
