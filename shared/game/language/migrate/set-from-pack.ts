/* @layer shared-game @kind logic */
import type { LanguagePack } from '@shared/types/language';
import type { DialogueEntry, LanguageSet } from '../types';
import { parseTokens } from '../tokens/parse-tokens';
import { emptyNameTable } from './empty-name-table';

const dialogueEntryFromLine = (line: LanguagePack['lines'][number]): DialogueEntry => ({
  id: line.id,
  tokens: parseTokens(line.content),
});

const setFromPack = (pack: LanguagePack): LanguageSet => ({
  id: pack.meta.code,
  name: pack.meta.code,
  base: pack.meta.code,
  origin: 'rom',
  version: 1,
  dialogue: pack.lines.map(dialogueEntryFromLine),
  glossary: [],
  names: emptyNameTable(),
});

export { setFromPack };
