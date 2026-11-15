/* @layer shared-asset-extraction @kind types */
import type { LanguageConfig } from '../../data/language-data';

type DictionarySource = 'base' | 'table' | 'release' | 'fallback';

interface DictionaryPick {
  entries: Uint8Array[];
  source: DictionarySource;
  release: string;
}

interface PointerTableRead {
  at: number;
  count: number;
  bank: number;
  commandStart: number;
  lastLength: number | null;
}

interface DictionaryInput {
  patched: Uint8Array;
  base: Uint8Array | null;
  config: LanguageConfig;
}

export type { DictionaryInput, DictionaryPick, DictionarySource, PointerTableRead };
