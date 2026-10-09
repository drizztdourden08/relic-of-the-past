/* @layer renderer-lib @kind logic */
import { fetchToBytes } from '@app/download/download';
import type { LanguageResult } from './languages-store.type';
import { emitLanguageProgress } from './emit-language-progress';
import { extractFromBytes } from './extract-from-bytes';
import { languageFailure } from './language-failure';
import { resolveRomBytes } from './resolve-rom-bytes';

const extractLanguageFromUrl = async (url: string, code: string): Promise<LanguageResult> => {
  try {
    const bytes = await fetchToBytes(url, (loaded, total) => emitLanguageProgress('download', loaded, total ?? undefined));
    return await extractFromBytes(await resolveRomBytes(bytes), code);
  } catch (err) {
    return languageFailure(err);
  }
};

export { extractLanguageFromUrl };
