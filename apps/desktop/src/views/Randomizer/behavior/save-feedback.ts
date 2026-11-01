/* @layer renderer-components @kind logic */
import type { ArchipelagoSaveFilesResult } from '@app/ipc';
import { CANCELLED_REASON, VANILLA_SPOTS_NOTICE } from './save-feedback.constants';
import type { SaveFeedback } from './save-feedback.type';

const feedbackOf = (result: ArchipelagoSaveFilesResult, recorded: boolean): SaveFeedback | null => {
  if (result.ok) {
    const saved = `Saved ${result.files.length} files to ${result.folder}`;
    return { tone: 'ok', text: recorded ? saved : `${saved}. ${VANILLA_SPOTS_NOTICE}` };
  }
  if (result.reason === CANCELLED_REASON) return null;
  return { tone: 'error', text: `Not saved: ${result.reason}` };
};

export { feedbackOf };
