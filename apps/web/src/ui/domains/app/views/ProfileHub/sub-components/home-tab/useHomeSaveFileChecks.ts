/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { computeSaveFileChecks } from './compute-save-file-checks';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import { RUN_OF_MODE } from './home-tab.constants';
import type { SaveFileChecks } from './home-tab.type';

const useHomeSaveFileChecks = (
  profileId: string,
  mode: ProfileModeId,
  isGameRunning: boolean,
): SaveFileChecks[] | null => {
  const [files, setFiles] = useState<SaveFileChecks[] | null>(null);

  useEffect(() => {
    const runKind = RUN_OF_MODE[mode];
    if (runKind === null) {
      setFiles(null);
      return;
    }
    let cancelled = false;
    computeSaveFileChecks(profileId, runKind)
      .then((rows) => { if (!cancelled) setFiles(rows); })
      .catch(() => { if (!cancelled) setFiles(null); });
    return () => { cancelled = true; };
  }, [profileId, mode, isGameRunning]);

  return files;
};

export { useHomeSaveFileChecks };
