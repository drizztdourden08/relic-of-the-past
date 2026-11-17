/* @layer shared-asset-extraction @kind constants */
const TILEMAP_GLYPHS = 256;

const GLYPHS_PER_ROW = 16;

const TILES_PER_ROW = 32;

const BOTTOM_TILE_OFFSET = 16;

const TOP_LEFT_TILE = 0;

const BOTTOM_LEFT_TILE = 1;

const JA_NAME_GRID_BYTES = 320;

const JA_MENU_TILEMAP_SLOTS: readonly number[] = [0, 1, 2, 3, 4];

const JA_COPYRIGHT_SHEET = 8;

const JA_COPYRIGHT_TILES: readonly number[] = [0, 1, 2, 3, 4, 16, 17, 18, 19, 20, 40];

export {
  BOTTOM_LEFT_TILE, BOTTOM_TILE_OFFSET, GLYPHS_PER_ROW, JA_COPYRIGHT_SHEET, JA_COPYRIGHT_TILES, JA_MENU_TILEMAP_SLOTS,
  JA_NAME_GRID_BYTES, TILEMAP_GLYPHS, TILES_PER_ROW, TOP_LEFT_TILE,
};
