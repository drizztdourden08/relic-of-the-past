/* @layer shared-asset-extraction @kind types */
import type { DialogueLine } from '../../sets-types';
import type { GlyphMap } from '../glyph-map';
import type { ScreenTable } from '../../screens/screen-table.type';

interface PackedLangEntry {
  code: string;
  base: string;
  langData: Buffer;
  fontPacked: Buffer;
  flags: number;
  screens?: readonly ScreenTable[];
}

interface ExtractedLangEntry extends PackedLangEntry {
  fontData: Buffer;
  fontWidth: Buffer;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  lines: DialogueLine[];
}

interface PackedEntryParams {
  code: string;
  texts: string[];
  fontData: Buffer;
  fontWidth: Buffer;
  index: number;
  glyphs?: GlyphMap;
  letters?: readonly string[];
}

export type { ExtractedLangEntry, PackedEntryParams, PackedLangEntry };
