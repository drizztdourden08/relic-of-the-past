/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { buildPackedEntry } from '@rotp/asset-extraction';
import type { PackedLangEntry } from '@rotp/asset-extraction';
import { dialogueTexts } from '@rotp/asset-extraction';
import { languagePackPaths } from './language-pack-paths';
import { listLanguageCodes } from './list-language-codes';

const loadPackedLanguages = async (): Promise<PackedLangEntry[]> => {
  const codes = await listLanguageCodes();
  const entries = await Promise.all(codes.map(async (code) => {
    try {
      const [text, fontData, fontWidth] = await Promise.all([
        readFile(languagePackPaths.dialogue(code), 'utf-8'),
        readFile(languagePackPaths.font(code)),
        readFile(languagePackPaths.fontWidth(code)),
      ]);
      return buildPackedEntry({ code, texts: dialogueTexts(text), fontData, fontWidth, index: 1 });
    } catch {
      return null;
    }
  }));
  return entries.filter((e): e is PackedLangEntry => e !== null);
};

export { loadPackedLanguages };
