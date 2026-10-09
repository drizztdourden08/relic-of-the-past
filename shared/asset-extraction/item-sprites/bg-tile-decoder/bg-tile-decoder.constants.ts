/* @layer shared-asset-extraction @kind constants */
const TILE_BYTES = 24;
const TILES_PER_SHEET = 64;
const QUADRANTS: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
const TILE_NUMBER_MASK = 0x3ff;
const PALETTE_ROW_SHIFT = 10;
const FLIP_X_BIT = 0x4000;
const FLIP_Y_BIT = 0x8000;

export {
  FLIP_X_BIT, FLIP_Y_BIT, PALETTE_ROW_SHIFT, QUADRANTS, TILE_BYTES, TILE_NUMBER_MASK, TILES_PER_SHEET,
};
