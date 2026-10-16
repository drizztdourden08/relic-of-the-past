/* @layer renderer-components @kind logic */
import { LANGUAGE_NAMES } from '../language-names.constants';
import type { LanguageOutcome, SettleExtractionParams } from './language-manager.type';

const settleExtraction = async (params: SettleExtractionParams): Promise<LanguageOutcome> => {
  const { result, refresh, setSelected } = params;
  if (!result.success) return { success: false, message: result.error };
  await refresh();
  setSelected(result.code);
  return { success: true, message: `Extracted ${LANGUAGE_NAMES[result.code] ?? result.code} language pack` };
};

export { settleExtraction };
