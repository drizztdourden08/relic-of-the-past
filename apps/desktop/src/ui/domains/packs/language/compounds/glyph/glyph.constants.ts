/* @layer renderer-components @kind constants */
import { GLYPH_RAMP } from '@shared/asset-extraction/text/data/glyph-ramp';

const CELL_W = 8;
const CELL_H = 16;
const TILE_BYTES = 16;
const TILE_SIDE = 8;
const TILES_PER_CHAR_ROW = 32;
const BOTTOM_TILE_STEP = 16;
const MAX_GLYPH = 127;
const RAMP_FILL = GLYPH_RAMP.map(([r, g, b]) => `rgb(${r} ${g} ${b})`);

export { BOTTOM_TILE_STEP, CELL_H, CELL_W, MAX_GLYPH, RAMP_FILL, TILE_BYTES, TILE_SIDE, TILES_PER_CHAR_ROW };
