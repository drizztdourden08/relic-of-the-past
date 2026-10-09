/* @layer electron-main @kind logic */
import { readFile, readdir } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';
import { languagePackPaths } from './language-pack-paths';

const hasMeta = async (code: string): Promise<boolean> => {
  try {
    await readFile(languagePackPaths.meta(code));
    return true;
  } catch {
    return false;
  }
};

const listLanguageCodes = async (): Promise<string[]> => {
  try {
    const entries = await readdir(getUserDataPath('languages'), { withFileTypes: true });
    const codes: string[] = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (await hasMeta(e.name)) codes.push(e.name);
    }
    return codes;
  } catch {
    return [];
  }
};

export { listLanguageCodes };
