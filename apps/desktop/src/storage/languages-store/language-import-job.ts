/* @layer renderer-lib @kind logic */
import { runImportJob } from '../import-job';
import type { ImportReport } from '../import-job';
import { errorMessage } from '../error-message';
import type { LanguageResult } from './languages-store.type';

const failureOf = (result: LanguageResult): string | null => (result.success ? null : result.error);

const languageImportJob = async (work: (report: ImportReport) => Promise<LanguageResult>): Promise<LanguageResult> => {
  try {
    return await runImportJob({ kind: 'language', title: 'Importing a language', work, failureOf });
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
};

export { languageImportJob };
