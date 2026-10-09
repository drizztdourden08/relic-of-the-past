/* @layer renderer-hud @kind constants */
const TILE_BYTES = 32;
const TILE_PIXELS = 8;
const TILES_PER_ROW = 8;
const SECOND_BITPLANE_PAIR_OFFSET = 16;
const POLY_TILE_ROW_ORDER = [0x00, 0x10, 0x20, 0x30, 0x08, 0x18, 0x28, 0x38] as const;

export { POLY_TILE_ROW_ORDER, SECOND_BITPLANE_PAIR_OFFSET, TILE_BYTES, TILE_PIXELS, TILES_PER_ROW };
