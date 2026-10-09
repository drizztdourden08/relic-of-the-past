/* @layer renderer-lib @kind logic */
import { errorMessage } from '../error-message';
import type { LanguageResult } from './languages-store.type';
import { emitLanguageProgress } from './emit-language-progress';

const languageFailure = (err: unknown): LanguageResult => {
  const msg = errorMessage(err);
  emitLanguageProgress('error', undefined, undefined, msg);
  return { success: false, error: msg };
};

export { languageFailure };
