/* @layer shared-asset-extraction @kind types */
import type { RomData, RomLanguage } from '../../rom/rom-types';
import type { ScreenPayload } from '../../screens/screen-payload.type';
import type { LanguageConfig } from '../data/language-data';
import type { DictionaryPick } from './dictionary';
import type { FontReference, GlyphReading } from './font';
import type { StreamPlan } from './stream';

type PatchedPartId = 'font-tiles' | 'letters' | 'dictionary' | 'dialogue' | 'menu-text' | 'credits' | 'screens';

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
  menu: Record<string, string>;
  credits: Record<string, string>;
  screens: ScreenPayload | null;
}

interface PatchedLanguage {
  success: boolean;
  parts: PatchedPartReport[];
  texts: string[];
  menu: Record<string, string>;
  credits: Record<string, string>;
  screens: ScreenPayload | null;
}

type PatchedPart = (work: PatchedWork) => PatchedPartReport;

export type {
  PatchedLanguage, PatchedLanguageInput, PatchedPart, PatchedPartId, PatchedPartReport, PatchedPartStatus, PatchedWork,
};
