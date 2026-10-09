/* @layer shared-asset-extraction @kind types */
import type { DialogueLine } from '../../sets-types';

interface PackedLangEntry {
  code: string;
  langData: Buffer;
  fontPacked: Buffer;
  flags: number;
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
}

export type { ExtractedLangEntry, PackedEntryParams, PackedLangEntry };
