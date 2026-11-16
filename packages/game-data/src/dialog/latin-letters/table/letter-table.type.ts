/* @layer shared-game @kind types */
import type { GlyphMap } from '@rotp/asset-extraction';

interface BakedLetterTable {
  texts: string[];
  letters: string[];
  glyphs: GlyphMap;
}

export type { BakedLetterTable };
