/* @layer renderer-hud @kind constants */
/**
 * True-scale geometry for the gear screen, in SNES pixels, from the screen
 * area's own top-left corner.
 *
 * The published plan measures this panel's CONTENT at 152x88: a 40-pixel label
 * column plus five tiers at the menu's 24 pitch (40 + 4*24 + 16 = 152), and
 * four rows on that same pitch (3*24 + 16 = 88). The bordered box therefore
 * measures 168x104 outside its frame, one tile larger on every side. That is unlike
 * the items box, whose published 152x104 is the OUTSIDE measurement.
 *
 * THE ROW COUNT IS NO LONGER A CONSTANT. A fourth ladder (the arrow row) makes
 * it five rows, and a box sized for four would have clipped it, so the box
 * height, and the hint that sits under the box, are both computed from the rows
 * actually handed in. At four rows they return exactly the published numbers,
 * so nothing moved when the arithmetic replaced the constants.
 *
 * The vertical budget, since a fifth row spends some of it: the panel area runs
 * from y 56 to the legend's strip at y 208 (152 pixels), of which four rows
 * take 104 and five take 128, leaving 24. Width is untouched: the longest row is
 * still the five-tier blade at 152, and the two-rung arrow row is 80.
 */

/** Content of the gear box in tiles. 19 tiles = 152 = the widest row. */
const GEAR_BOX_COLS = 19;

/** A tier cell is an item cell: 16x16 art on the menu's 24 pitch. */
const TIER_SIZE = 16;
const TIER_PITCH = 24;

/** Sword, guard, armour, arrows, then the passives, on the same 24 pitch vertically. */
const ROW_PITCH = 24;

/** The label column, wide enough for the longest ladder name at half a tile. */
const LABEL_W = 40;
/** Labels are half-height so a five-letter name fits the 40-pixel column. */
const LABEL_GLYPH = 6;

/** The frame the bordered box adds outside its content, one tile per side. */
const BOX_FRAME = 16;
const TILE = 8;

/** Content height for `rows` rows: the last one is art, the rest are pitch. */
const gearContentHeight = (rows: number): number =>
  Math.max(rows - 1, 0) * ROW_PITCH + TIER_SIZE;

/** The box's content height in tiles, which is what `PauseBorderBox` is given. */
const gearBoxRows = (rows: number): number => gearContentHeight(rows) / TILE;

/** The hero column, one tile past the 168-wide gear box. */
const HERO_X = 176;
const HERO_COLUMN_W = 96;
const HERO_Y = 4;

/** The portrait is drawn three times native here, because this screen is about gear. */
const HERO_ZOOM = 3;

/**
 * The hint, BELOW the panel instead of beside its last row.
 *
 * A hint level with the frame's bottom row and centred in the 96-pixel portrait
 * column grew back across the panel for any line wider than that column. It now
 * starts half a tile clear of the box, which is why it follows the row count
 * instead of sitting on a fixed number. The caller wraps it to the column,
 * so neither half of that can happen again. At five rows the box ends at 128 and
 * three lines of half-tile text end at 150, still clear of the legend's strip.
 */
const hintY = (rows: number): number => gearContentHeight(rows) + BOX_FRAME + TILE / 2;
const HINT_GLYPH = 6;

export {
  GEAR_BOX_COLS, HERO_COLUMN_W, HERO_X, HERO_Y, HERO_ZOOM, HINT_GLYPH,
  LABEL_GLYPH, LABEL_W, ROW_PITCH, TIER_PITCH, TIER_SIZE, gearBoxRows, hintY,
};
