/* @layer shared-game @kind logic */
import type { LanguagePack, ScreenPayload } from '@rotp/asset-extraction';
import type { DialogueEntry, LanguageScript, LanguageSet } from '../types';
import { parseTokens } from '../tokens/parse-tokens';
import { namesFromScreens } from './names-from-screens';

const dialogueEntryFromLine = (line: LanguagePack['lines'][number]): DialogueEntry => ({
  id: line.id,
  tokens: parseTokens(line.content),
});

const setFromPack = (pack: LanguagePack, screens?: ScreenPayload, script: LanguageScript = 'latin'): LanguageSet => ({
  id: pack.meta.code,
  name: pack.meta.code,
  base: pack.meta.code,
  origin: 'rom',
  version: 1,
  dialogue: pack.lines.map(dialogueEntryFromLine),
  glossary: [],
  names: namesFromScreens(screens),
  script,
  ...(screens ? { screens } : {}),
});

export { setFromPack };
