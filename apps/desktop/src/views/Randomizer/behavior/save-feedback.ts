/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SaveArchipelagoFilesResult } from '@drizztdourden08/brock-randomizer/preload';
import { CANCELLED_REASON } from './save-feedback.constants';
import type { SaveFeedback } from './save-feedback.type';

const feedbackOf = (t: I18n['t'], result: SaveArchipelagoFilesResult, recorded: boolean): SaveFeedback | null => {
  if (result.ok) {
    const values = { count: result.files.length, folder: result.folder };
    return { tone: 'ok', text: recorded ? t('views-randomizer:feedback.saved', values) : t('views-randomizer:feedback.savedVanilla', values) };
  }
  if (result.reason === CANCELLED_REASON) return null;
  return { tone: 'error', text: t('views-randomizer:feedback.notSaved', { reason: result.reason }) };
};

export { feedbackOf };
