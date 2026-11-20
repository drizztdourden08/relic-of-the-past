/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { runImportJob } from '../import-job';
import type { ImportReport } from '../import-job';
import { errorText, failureLine } from '../localized-error';
import type { LanguageResult } from './languages-store.type';

const failureOf = (result: LanguageResult): string | null => (result.success ? null : failureLine(result.error));

const languageImportJob = async (work: (report: ImportReport) => Promise<LanguageResult>): Promise<LanguageResult> => {
  try {
    return await runImportJob({ kind: 'language', title: msg('data-manager:jobs.import-language'), work, failureOf });
  } catch (err) {
    return { success: false, error: errorText(err) };
  }
};

export { languageImportJob };
