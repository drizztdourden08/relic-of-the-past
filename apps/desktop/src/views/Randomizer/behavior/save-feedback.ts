/* @layer renderer-components @kind logic */
import type { ArchipelagoSaveFilesResult } from '@app/ipc';
import type { SaveFeedback } from './save-feedback.type';

/** The reason the main process gives when the folder picker is dismissed. */
const CANCELLED_REASON = 'cancelled';

const VANILLA_SPOTS_NOTICE = 'NPC, pond and world spots stay vanilla: recreate the profile to include them';

/** One line for the outcome. A dismissed picker says nothing, since the player chose it. */
const feedbackOf = (result: ArchipelagoSaveFilesResult, recorded: boolean): SaveFeedback | null => {
  if (result.ok) {
    const saved = `Saved ${result.files.length} files to ${result.folder}`;
    return { tone: 'ok', text: recorded ? saved : `${saved}. ${VANILLA_SPOTS_NOTICE}` };
  }
  if (result.reason === CANCELLED_REASON) return null;
  return { tone: 'error', text: `Not saved: ${result.reason}` };
};

export { feedbackOf };
