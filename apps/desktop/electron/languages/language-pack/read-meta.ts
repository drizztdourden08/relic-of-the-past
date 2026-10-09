/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import type { LanguageMeta } from '@rotp/asset-extraction';
import { languagePackPaths } from './language-pack-paths';

const readMeta = async (code: string): Promise<LanguageMeta | null> => {
  try {
    return JSON.parse(await readFile(languagePackPaths.meta(code), 'utf-8')) as LanguageMeta;
  } catch {
    return null;
  }
};

export { readMeta };
