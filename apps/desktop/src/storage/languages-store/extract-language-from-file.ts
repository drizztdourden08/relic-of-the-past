/* @layer renderer-lib @kind logic */
import type { LanguageResult } from './languages-store.type';
import { extractFromBytes } from './extract-from-bytes';
import { languageFailure } from './language-failure';
import { resolveRomBytes } from './resolve-rom-bytes';

const extractLanguageFromFile = async (file: File): Promise<LanguageResult> => {
  try {
    return await extractFromBytes(await resolveRomBytes(new Uint8Array(await file.arrayBuffer())));
  } catch (err) {
    return languageFailure(err);
  }
};

export { extractLanguageFromFile };
