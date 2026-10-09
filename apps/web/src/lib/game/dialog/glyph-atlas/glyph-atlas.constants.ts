/* @layer bridge-wasm @kind constants */
const CELL_W = 8;
const CELL_H = 16;
const COLUMNS = 16;
const GLYPHS = 128;
const TILE_BYTES = 16;
const TILES_PER_GLYPH_ROW = 32;
const BOTTOM_TILE_STEP = 16;
const BODY_ENTRY = 2;
const CACHE_LIMIT = 8;
const SHEET_TILES = 0;
const WIDTH_TABLE = 1;

export {
  CELL_W, CELL_H, COLUMNS, GLYPHS, TILE_BYTES, TILES_PER_GLYPH_ROW, BOTTOM_TILE_STEP, BODY_ENTRY, CACHE_LIMIT,
  SHEET_TILES, WIDTH_TABLE,
};
