/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { supersededMap, withSupersededRepointed } from '@rotp/msu';
import * as msuStore from '@app/lib/storage/msu-store';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';
import type { SupersededParams } from './useSupersededFiles.type';

const supersededNames = (names: string[]): Set<string> => new Set(supersededMap(names).keys());

const useSupersededFiles = (params: SupersededParams) => {
  const { pack, files, saveBase, reload } = params;
  const [removing, setRemoving] = useState(false);

  const names = useMemo(() => files.map((file) => file.name), [files]);
  const superseded = useMemo(() => supersededNames(names), [names]);

  const totalBytes = useMemo(
    () => files.reduce((sum, file) => (superseded.has(file.name) ? sum + file.size : sum), 0),
    [files, superseded],
  );

  const removeAll = useCallback(async (): Promise<ActionResult> => {
    const doomed = [...superseded];
    if (doomed.length === 0) return { success: false, message: 'Nothing is superseded.' };
    setRemoving(true);
    try {
      if (saveBase !== null) {
        const repointed = withSupersededRepointed(saveBase, names);
        if (repointed !== saveBase) await msuStore.writeMsuManifest(pack, repointed);
      }
      for (const name of doomed) await msuStore.deleteMsuTrackFile(pack, name);
      const plural = doomed.length === 1 ? '' : 's';
      return { success: true, message: `Removed ${doomed.length} superseded original${plural}` };
    } catch (err) {
      return failure(err, 'Could not remove every superseded original');
    } finally {
      setRemoving(false);
      reload();
    }
  }, [pack, names, saveBase, superseded, reload]);

  return { superseded, count: superseded.size, totalBytes, removing, removeAll };
};

export { useSupersededFiles };
