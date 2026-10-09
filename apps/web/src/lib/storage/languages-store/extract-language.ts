/* @layer renderer-lib @kind logic */
import { platformFiles } from '../platform-files';
import type { LanguageResult } from './languages-store.type';
import { extractFromBytes } from './extract-from-bytes';

const extractLanguage = async (romFile: string, code: string): Promise<LanguageResult> => {
  const romBytes = await platformFiles().readBytes(`roms/${romFile}`);
  if (!romBytes) return { success: false, error: `ROM not found: ${romFile}` };
  return extractFromBytes(romBytes, code);
};

export { extractLanguage };
