/* @layer shared-asset-extraction @kind logic */
import type { LanguageConfig } from '../../data/language-data';
import { kLanguages } from '../../data/language-data';
import { encodeDictionary } from '../../dialogue-encoder';
import type { DictionaryInput, DictionaryPick } from './dictionary.type';
import { findBytes } from './find-bytes';
import { joinEntries } from './join-entries';
import { scanPointerTable } from './scan-pointer-table';
import { tableFromBase } from './table-from-base';

const sameLayout = (left: LanguageConfig, right: LanguageConfig): boolean =>
  left.commandStart === right.commandStart && left.switchBank === right.switchBank
  && left.dictBaseDec === right.dictBaseDec;

const presentIn = (patched: Uint8Array, entries: readonly Uint8Array[]): boolean =>
  findBytes(patched, joinEntries(entries)) >= 0;

const otherRelease = (input: DictionaryInput): DictionaryPick | null => {
  for (const other of Object.values(kLanguages)) {
    if (other.id === input.config.id || !sameLayout(other, input.config)) continue;
    const entries = encodeDictionary(other.id);
    if (presentIn(input.patched, entries)) return { entries, source: 'release', release: other.id };
  }
  return null;
};

const pickDictionary = (input: DictionaryInput): DictionaryPick => {
  const own = encodeDictionary(input.config.id);
  const release = input.config.id;
  if (presentIn(input.patched, own)) return { entries: own, source: 'base', release };
  const table = tableFromBase(input) ?? scanPointerTable(input);
  if (table) return { entries: table, source: 'table', release };
  return otherRelease(input) ?? { entries: own, source: 'fallback', release };
};

export { pickDictionary };
