/* @layer renderer-components @kind logic */
/**
 * The arithmetic that puts one character of a dialogue font onto a screen: which
 * tiles spell it, and where each of its pixels lands.
 *
 * A character is two stacked 8x8 tiles making 8x16. The sheet stores 16
 * characters per row and each character row spans TWO tile rows, so a character's
 * halves are sixteen tiles apart rather than adjacent.
 *
 * `edgeAt` is the whole reason this is a module rather than three lines inside the
 * painter. Both edges of every source pixel come from the same mapping, so a
 * pixel's rectangle ends exactly where its neighbour's begins: no overlap to
 * darken a seam, no gap to show the ground through. Giving each pixel a width of
 * `span / cells` instead accumulates a fraction of a device pixel per column and
 * frays the far edge — which is what made an earlier version of this look blurry.
 */

/** One character's source size, in game pixels. */
const CELL_W = 8;
const CELL_H = 16;

/** Bytes one 8x8 2bpp tile occupies in the sheet. */
const TILE_BYTES = 16;

/** Tiles one row of characters occupies: sixteen across, two tile rows deep. */
const TILES_PER_CHAR_ROW = 32;

/** Tiles between a character's top half and its bottom half. */
const BOTTOM_TILE_STEP = 16;

/** Characters the 256-tile sheet can spell, so the highest index it holds. */
const MAX_GLYPH = 127;

/** The tile a character's top half is stored in. */
const topTileOf = (glyph: number): number =>
  (glyph >> 4) * TILES_PER_CHAR_ROW + (glyph & 15);

/**
 * Where the boundary before source column or row `n` lands inside a box `span`
 * device pixels long, given the source is `cells` long. Pass `n + 1` for the far
 * edge of the same pixel and subtract: that difference IS its size.
 */
const edgeAt = (n: number, span: number, cells: number): number =>
  Math.round((n * span) / cells);

/** True when a sheet is long enough to hold both halves of `glyph`. */
const sheetHolds = (glyph: number, tileCount: number): boolean => (
  Number.isInteger(glyph)
  && glyph >= 0
  && glyph <= MAX_GLYPH
  && topTileOf(glyph) + BOTTOM_TILE_STEP < tileCount
);

export {
  edgeAt, sheetHolds, topTileOf,
  BOTTOM_TILE_STEP, CELL_H, CELL_W, MAX_GLYPH, TILE_BYTES,
};
