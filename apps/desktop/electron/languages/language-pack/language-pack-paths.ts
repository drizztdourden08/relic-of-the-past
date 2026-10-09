/* @layer electron-main @kind logic */
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';

const langDir = (code: string): string => getUserDataPath('languages', code);

const languagePackPaths = {
  dir: langDir,
  dialogue: (code: string): string => join(langDir(code), 'dialogue.txt'),
  font: (code: string): string => join(langDir(code), 'font.bin'),
  fontWidth: (code: string): string => join(langDir(code), 'font-width.bin'),
  meta: (code: string): string => join(langDir(code), 'meta.json'),
};

export { languagePackPaths };
