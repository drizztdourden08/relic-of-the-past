/* @layer shared-asset-extraction @kind types */
import type { GlyphMap } from '../../glyph-map';

interface FontReference {
  release: string;
  tiles: Uint8Array;
  widths: Uint8Array | null;
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

interface FontWidthsFound {
  widths: Uint8Array;
  source: 'base' | 'moved' | 'release' | 'unchecked';
}

interface FontWidthsSearch {
  patched: Uint8Array;
  at: number;
  count: number;
  reference: Uint8Array | null;
}

interface GlyphReading {
  alphabet: string[];
  glyphs: GlyphMap;
  changed: number[];
  unknown: number[];
  checked: boolean;
  restyled: boolean;
}

interface GlyphIdentify {
  tiles: Uint8Array;
  references: readonly FontReference[];
  alphabet: readonly string[];
  glyphLimit: number;
}

export type {
  FontReference, FontTilesFound, FontTilesSearch, FontWidthsFound, FontWidthsSearch, GlyphIdentify, GlyphReading,
};
