/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import type { ExtractedPack } from '@rotp/languages';
import { runExtractStep } from '../extraction-client';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';
import type { ImportReport } from '../import-job';
import type { LanguageResult } from './languages-store.type';

const extractPack = async (romBytes: Uint8Array, report: ImportReport): Promise<LanguageResult> => {
  report.phase('decode', 'Decoding dialogue...');
  const pack = await runExtractStep<'language', ExtractedPack>({
    step: 'language', title: 'Extracting the dialogue', subject: 'rom', romBytes, input: undefined,
  });
  await languages.writePack(platformFiles(), pack);
  report.phase('extract', 'Baking into assets...');
  await recompileAll();
  return { success: true, code: pack.code };
};

export { extractPack };
