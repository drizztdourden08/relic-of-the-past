/* @layer renderer-components @kind hook */
/**
 * Per-save-file checks readout for the home hero, computed offline from the
 * battery save on disk (compute-save-file-checks.ts), so it never shows the
 * live subscription's false zero. Off for Vanilla Safe. The file on disk is
 * the last in-game save, so reading it mid-session is safe: recomputes on
 * mount (each time the hub opens), on profile or mode change, and when a
 * session starts or ends.
 */
import { useEffect, useState } from 'react';
import { computeSaveFileChecks } from './compute-save-file-checks';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import type { SaveFileChecks } from './home-tab.type';

const useHomeSaveFileChecks = (
  profileId: string,
  mode: ProfileModeId,
  isGameRunning: boolean,
): SaveFileChecks[] | null => {
  const [files, setFiles] = useState<SaveFileChecks[] | null>(null);

  useEffect(() => {
    if (mode === 'vanilla-safe') {
      setFiles(null);
      return;
    }
    let cancelled = false;
    const isRandomized = mode === 'randomizer' || mode === 'randomizer-online';
    computeSaveFileChecks(profileId, isRandomized)
      .then((rows) => { if (!cancelled) setFiles(rows); })
      .catch(() => { if (!cancelled) setFiles(null); });
    return () => { cancelled = true; };
  }, [profileId, mode, isGameRunning]);

  return files;
};

export { useHomeSaveFileChecks };
