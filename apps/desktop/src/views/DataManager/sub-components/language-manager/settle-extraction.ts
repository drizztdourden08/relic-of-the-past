/* @layer renderer-components @kind logic */
import { LANGUAGE_NAMES } from '../language-names.constants';
import type { LanguageOutcome, SettleExtractionParams } from './language-manager.type';

const settleExtraction = async (params: SettleExtractionParams): Promise<LanguageOutcome> => {
  const { result, code, refresh, setSelected } = params;
  if (!result.success) return { success: false, message: result.error ?? 'Extraction failed' };
  await refresh();
  setSelected(code);
  return { success: true, message: `Extracted ${LANGUAGE_NAMES[code] ?? code} language pack` };
};

export { settleExtraction };
