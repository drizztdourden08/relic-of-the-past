/* @layer shared-storage @kind types */
import type { ScreenPayload } from '@rotp/asset-extraction';
import type { TextOverrides } from '../../messages';

type LanguageSetSummary = {
  id: string;
  name: string;
  base: string;
  origin: 'rom' | 'custom';
  lineCount: number;
};

type RomFontBytes = {
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

interface ExtractedPayload {
  code: string;
  description: string;
  dialogue: string;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
}

interface ExtractedPack extends ExtractedPayload, RomFontBytes {
  screens?: ScreenPayload;
}

interface PatchedPack extends ExtractedPayload {
  name: string;
  base: string;
  credits: string;
  license: string;
  text: TextOverrides;
  screens?: ScreenPayload;
}

export type { ExtractedPack, ExtractedPayload, LanguageSetSummary, PatchedPack, RomFontBytes };
