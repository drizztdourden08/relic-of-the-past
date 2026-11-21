/* @layer shared-game @kind types */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import type { LanguageSet } from '../types';

type SetFont = {
  fontData: Buffer;
  fontWidth: Buffer;
};

type SetBakeInput = {
  set: LanguageSet;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

type BakedLanguages = {
  baseLanguage: PackedLangEntry;
  extraLanguages: PackedLangEntry[];
};

export type { BakedLanguages, SetBakeInput, SetFont };
