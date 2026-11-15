/* @layer shared-storage @kind types */
import type { GlyphMap } from '@rotp/asset-extraction';
import type { TextOverrides } from '../../messages';

type LanguageSetSummary = {
  id: string;
  name: string;
  base: string;
  origin: 'rom' | 'custom';
  lineCount: number;
};

type SetFontBytes = {
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

interface ExtractedPack {
  code: string;
  description: string;
  dialogue: string;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
}

interface PatchedPack extends ExtractedPack {
  name: string;
  base: string;
  credits: string;
  glyphs: GlyphMap;
  text: TextOverrides;
}

export type { ExtractedPack, LanguageSetSummary, PatchedPack, SetFontBytes };
