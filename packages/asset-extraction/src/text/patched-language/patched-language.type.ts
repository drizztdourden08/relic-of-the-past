/* @layer shared-asset-extraction @kind types */
import type { RomData, RomLanguage } from '../../rom/rom-types';
import type { LanguageConfig } from '../data/language-data';
import type { GlyphMap } from '../glyph-map';
import type { DictionaryPick } from './dictionary';
import type { FontReference, GlyphReading } from './font';
import type { StreamPlan } from './stream';

type PatchedPartId = 'font-tiles' | 'font-widths' | 'letters' | 'dictionary' | 'dialogue' | 'menu-text' | 'credits';

type PatchedPartStatus = 'ok' | 'recovered' | 'failed';

interface PatchedPartReport {
  part: PatchedPartId;
  status: PatchedPartStatus;
  detail: string;
}

interface PatchedLanguageInput {
  patched: RomData;
  baseRom: RomData | null;
  references: readonly FontReference[];
}

interface PatchedWork extends PatchedLanguageInput {
  base: RomLanguage;
  config: LanguageConfig;
  tiles: Uint8Array | null;
  reading: GlyphReading | null;
  letters: string[];
  dictionary: DictionaryPick | null;
  plan: StreamPlan | null;
  texts: string[] | null;
  glyphs: GlyphMap;
  widths: Uint8Array | null;
  menu: Record<string, string>;
  credits: Record<string, string>;
}

interface PatchedLanguage {
  success: boolean;
  parts: PatchedPartReport[];
  texts: string[];
  fontData: Uint8Array;
  fontWidth: Uint8Array;
  glyphs: GlyphMap;
  menu: Record<string, string>;
  credits: Record<string, string>;
}

type PatchedPart = (work: PatchedWork) => PatchedPartReport;

export type {
  PatchedLanguage, PatchedLanguageInput, PatchedPart, PatchedPartId, PatchedPartReport, PatchedPartStatus, PatchedWork,
};
