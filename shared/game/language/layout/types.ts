/* @layer shared-game @kind types */
/**
 * Layout types for the text box the engine actually draws.
 *
 * The box interior is fixed at three rows of 21 tiles, and the renderer
 * advances the pen by each glyph's own width without ever checking the row
 * bound. A row authored wider than the interior overruns into the next row's
 * tiles instead of wrapping. So measuring a line in pixels is the only way to
 * know whether authored text is safe, and every consumer here shares one
 * definition of that measurement.
 */

/** Usable interior of one row, in pixels (21 tiles of 8px). */
const ROW_WIDTH_PX = 168;

/** Rows a single box holds at once. */
const ROWS_PER_BOX = 3;

/**
 * Everything needed to size and draw one language's glyphs: the per-glyph
 * advance table, and the alphabet that maps a character to its glyph index.
 */
type GlyphMetrics = {
  widths: Uint8Array;
  alphabet: readonly string[];
};

/** The glyph tiles themselves, paired 8x8 halves making 8x16 characters. */
type GlyphSheet = {
  tiles: Uint8Array;
};

/** One laid-out row: the glyph indices to draw, and how wide they came out. */
type RowFit = {
  /** 1-based row within the box. */
  row: number;
  /** Glyph indices into the language's alphabet, in draw order. */
  glyphs: number[];
  widthPx: number;
  /** True when the row exceeds the interior and the engine would corrupt it. */
  overflow: boolean;
};

/**
 * One box-worth of text as the player sees it before the next wait. A message
 * is a sequence of these; the engine never clears the box between them, it
 * scrolls, so a screen carries whichever rows were rewritten.
 */
type ScreenFit = {
  /** 1-based screen within the message. */
  index: number;
  rows: RowFit[];
  /** The screen ends by waiting for a button instead of running straight on. */
  waitsForButton: boolean;
};

export { ROW_WIDTH_PX, ROWS_PER_BOX };
export type { GlyphMetrics, GlyphSheet, RowFit, ScreenFit };
