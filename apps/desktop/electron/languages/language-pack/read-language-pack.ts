/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { parseDialogueText } from '@rotp/asset-extraction';
import type { LanguagePack } from '@rotp/asset-extraction';
import { languagePackPaths } from './language-pack-paths';
import { readMeta } from './read-meta';

const readLanguagePack = async (code: string): Promise<LanguagePack | null> => {
  const meta = await readMeta(code);
  if (!meta) return null;
  try {
    const [text, font] = await Promise.all([
      readFile(languagePackPaths.dialogue(code), 'utf-8'),
      readFile(languagePackPaths.font(code)),
    ]);
    return {
      meta,
      lines: parseDialogueText(text),
      font: { tiles: Array.from(font), glyphCount: meta.glyphCount },
    };
  } catch {
    return null;
  }
};

export { readLanguagePack };
