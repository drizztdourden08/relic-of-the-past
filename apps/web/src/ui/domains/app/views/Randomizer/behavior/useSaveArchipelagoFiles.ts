/* @layer renderer-components @kind hook */
/**
 * Writes this profile's Archipelago files (the player file and the world
 * package) through the main process, which asks for the folder. The outcome
 * becomes one line of feedback. A cancelled picker says nothing, since the
 * player chose it.
 */
import { useCallback, useState } from 'react';
import type { ArchipelagoSaveFilesResult } from '@shared/types/archipelago-files';

/** The reason the main process gives when the folder picker is dismissed. */
const CANCELLED_REASON = 'cancelled';

interface SaveFeedback {
  tone: 'ok' | 'error';
  text: string;
}

const feedbackOf = (result: ArchipelagoSaveFilesResult): SaveFeedback | null => {
  if (result.ok) {
    const saved = `Saved ${result.files.length} files to ${result.folder}`;
    return { tone: 'ok', text: result.notice ? `${saved}. ${result.notice}` : saved };
  }
  if (result.reason === CANCELLED_REASON) return null;
  return { tone: 'error', text: `Not saved: ${result.reason}` };
};

const useSaveArchipelagoFiles = (profileId: string) => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      setFeedback(feedbackOf(await window.api.saveArchipelagoFiles(profileId)));
    } catch (err) {
      setFeedback({ tone: 'error', text: `Not saved: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setSaving(false);
    }
  }, [profileId]);

  return { saving, feedback, save };
};

export { useSaveArchipelagoFiles };
export type { SaveFeedback };
