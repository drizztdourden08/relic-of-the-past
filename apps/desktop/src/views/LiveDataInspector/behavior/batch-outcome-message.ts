/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { BatchResult } from '@app/data-inspector/recommendations/accept-all-certain';

const batchOutcomeMessage = (result: BatchResult, t: I18n['t']): string | null => {
  const left = result.skipped.length + result.failures.length;
  if (left === 0) return null;
  return t('views-live-data-inspector:batch.outcome', { accepted: result.accepted, left });
};

export { batchOutcomeMessage };
