/* @layer renderer-lib @kind logic */
import * as languages from '@shared/storage/languages';
import type { ExtractedPack } from '@shared/storage/languages';
import { runOnWorker } from '../extraction-client';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';
import type { LanguageResult } from './languages-store.type';
import { emitLanguageProgress } from './emit-language-progress';
import { languageFailure } from './language-failure';

const extractFromBytes = async (romBytes: Uint8Array, code: string): Promise<LanguageResult> => {
  try {
    emitLanguageProgress('decode', undefined, undefined, 'Decoding dialogue...');
    const pack = await runOnWorker<ExtractedPack>({ op: 'language', romBytes, code });
    await languages.writePack(platformFiles(), pack);
    emitLanguageProgress('extract', undefined, undefined, 'Baking into assets...');
    await recompileAll();
    emitLanguageProgress('done');
    return { success: true };
  } catch (err) {
    return languageFailure(err);
  }
};

export { extractFromBytes };
