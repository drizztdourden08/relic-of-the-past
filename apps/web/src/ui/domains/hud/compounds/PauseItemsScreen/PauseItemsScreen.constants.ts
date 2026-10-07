/* @layer renderer-hud @kind constants */
/**
 * True-scale geometry for the items screen, in SNES pixels, measured from the
 * screen area's own top-left corner (the view places that corner).
 *
 * Every figure here is the published plan's: a 16x16 icon on a 24 pitch, six
 * columns by four rows, which makes the grid's content 136x88 and the bordered
 * box around it 152x104. The bottle row is the same pitch, four cells wide.
 * The border box measures itself in whole tiles and adds one tile of frame on
 * each side, so the column/row counts below are the content in tiles.
 */

/** One inventory cell: a native 16x16 icon on a 24-pixel pitch. */
const CELL_SIZE = 16;
const CELL_PITCH = 24;

/** The grid: six columns, four rows, twenty item cells. */
const GRID_COLUMNS = 6;
const GRID_ROWS = 4;

/** Content of the items box in tiles. 17x11 tiles = 136x88 = the 6x4 grid. */
const ITEMS_BOX_COLS = 17;
const ITEMS_BOX_ROWS = 11;

/** Content of the bottle box in tiles. 11x2 tiles = 88x16 = four cells. */
const BOTTLE_BOX_COLS = 11;
const BOTTLE_BOX_ROWS = 2;
const BOTTLE_COLUMNS = 4;

/** The bottle box sits one tile below the items box (104 + 8). */
const BOTTLES_Y = 112;

/** The hero column: 96 wide, starting one tile past the 152-wide items box. */
const HERO_X = 160;
const HERO_COLUMN_W = 96;
const HERO_Y = 8;

/** The selected item's name, then the assignment hint, under the portrait. */
const NAME_Y = 62;
const HINT_Y = 78;
/** The hint is a whisper, not a label. Half a tile, so a long one still fits. */
const HINT_GLYPH = 6;

export {
  BOTTLES_Y, BOTTLE_BOX_COLS, BOTTLE_BOX_ROWS, BOTTLE_COLUMNS,
  CELL_PITCH, CELL_SIZE, GRID_COLUMNS, GRID_ROWS,
  HERO_COLUMN_W, HERO_X, HERO_Y, HINT_GLYPH, HINT_Y,
  ITEMS_BOX_COLS, ITEMS_BOX_ROWS, NAME_Y,
};
