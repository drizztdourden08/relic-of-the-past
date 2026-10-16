/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import type { ExtractedPack } from '@rotp/languages';
import { runOnWorker } from '../extraction-client';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';
import type { LanguageResult } from './languages-store.type';
import { emitLanguageProgress } from './emit-language-progress';
import { languageFailure } from './language-failure';

const extractFromBytes = async (romBytes: Uint8Array): Promise<LanguageResult> => {
  try {
    emitLanguageProgress('decode', undefined, undefined, 'Decoding dialogue...');
    const pack = await runOnWorker<ExtractedPack>({ op: 'language', romBytes });
    await languages.writePack(platformFiles(), pack);
    emitLanguageProgress('extract', undefined, undefined, 'Baking into assets...');
    await recompileAll();
    emitLanguageProgress('done');
    return { success: true, code: pack.code };
  } catch (err) {
    return languageFailure(err);
  }
};

export { extractFromBytes };
