/* @layer renderer-components @kind hook */
/**
 * Originals a converted file has taken over from: same stem in the target format (there is no
 * record of a past run, and none is needed). Removing them re-points the manifest FIRST, so a
 * reference the conversion did not move cannot leave its slot silent.
 */
import { useCallback, useMemo, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { supersededMap, withSupersededRepointed } from '@shared/storage/msu-superseded';
import * as msuStore from '@app/lib/storage/msu-store';
import { failure } from './usePackList';
import type { ActionResult, MsuFile } from '../msu.type';

interface SupersededParams {
  pack: string;
  files: MsuFile[];
  /** What the re-point WRITES into. Null for a classic pack, whose filenames are its wiring. */
  saveBase: MsuPackManifest | null;
  reload: () => void;
}

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

  // One at a time: a hundred concurrent deletes buys nothing over a directory being rewritten anyway.
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

export { supersededNames, useSupersededFiles };
export type { SupersededParams };
