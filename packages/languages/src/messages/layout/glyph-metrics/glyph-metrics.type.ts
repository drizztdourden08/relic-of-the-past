/* @layer shared-game @kind types */
type GlyphMatch = {
  index: number;
  length: number;
};

type AlphabetLookup = {
  byText: Map<string, number>;
  longest: number;
};

type GlyphRun = {
  glyphs: number[];
  unmatched: string[];
};

export type { AlphabetLookup, GlyphMatch, GlyphRun };
