/* @layer shared-game @kind types */
type GlyphMetrics = {
  widths: Uint8Array;
  alphabet: readonly string[];
};

type GlyphSheet = {
  tiles: Uint8Array;
};

type RowFit = {
  row: number;
  glyphs: number[];
  widthPx: number;
  overflow: boolean;
};

type ScreenFit = {
  index: number;
  rows: RowFit[];
  waitsForButton: boolean;
};

export type { GlyphMetrics, GlyphSheet, RowFit, ScreenFit };
