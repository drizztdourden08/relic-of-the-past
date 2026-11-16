/* @layer shared-asset-extraction @kind types */
import type { LearnedMark } from './accents';

interface FontReference {
  release: string;
  tiles: Uint8Array;
  alphabet: readonly string[];
  isBase: boolean;
}

interface FontTilesFound {
  tiles: Uint8Array;
  at: number;
  moved: boolean;
  checked: boolean;
}

interface FontTilesSearch {
  patched: Uint8Array;
  at: number;
  references: readonly FontReference[];
  glyphLimit: number;
}

type GlyphHow = 'font' | 'accent' | 'shape' | 'flipped';

interface GlyphNaming {
  glyph: number;
  token: string;
  how: GlyphHow;
  detail: string;
}

interface GlyphReading {
  alphabet: string[];
  changed: number[];
  unknown: number[];
  namings: GlyphNaming[];
  checked: boolean;
  restyled: boolean;
}

interface GlyphIdentify {
  tiles: Uint8Array;
  references: readonly FontReference[];
  alphabet: readonly string[];
  glyphLimit: number;
}

interface TileHunt {
  search: FontTilesSearch;
  keys: ReadonlyMap<string, string>;
  tried: Set<number>;
}

interface GlyphPass {
  alphabet: string[];
  changed: number[];
  unknown: number[];
  namings: GlyphNaming[];
  marks: LearnedMark[];
  matched: number;
}

export type {
  FontReference, FontTilesFound, FontTilesSearch, GlyphHow, GlyphIdentify,
  GlyphNaming, GlyphPass, GlyphReading, TileHunt,
};
