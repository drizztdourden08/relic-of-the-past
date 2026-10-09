/* @layer shared-storage @kind types */
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

export type { ExtractedPack, LanguageSetSummary, SetFontBytes };
