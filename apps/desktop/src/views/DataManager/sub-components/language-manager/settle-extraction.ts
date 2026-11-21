/* @layer renderer-components @kind logic */
import { languageLabel } from '../language-label';
import type { LanguageOutcome, SettleExtractionParams } from './language-manager.type';

const settleExtraction = async (params: SettleExtractionParams): Promise<LanguageOutcome> => {
  const { result, refresh, setSelected } = params;
  if (!result.success) return { success: false, message: params.text(result.error) };
  await refresh();
  setSelected(result.code);
  return { success: true, code: result.code, message: params.t('data-manager:language-manager.extracted', { name: languageLabel(result.code, params.t) }) };
};

export { settleExtraction };
