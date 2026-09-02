/* @layer renderer-components @kind hook */
/**
 * The originals a converted file has taken over from.
 *
 * Converting keeps the source on purpose — a run that deleted as it went would leave nothing to
 * fall back to if the result was wrong. So afterwards the pack holds both, and it costs twice
 * the disk it needs to. This is what identifies the halves that are now dead weight: a file
 * whose stem also exists in the target format.
 *
 * Same stem, not "was converted": there is no record of a past run, and there does not need to
 * be. A file sitting next to a same-stem one in the target format is superseded whichever way
 * round the two arrived.
 *
 * Removing them re-points the manifest FIRST. A reference the conversion did not move — a name
 * spelled in another case, a manifest saved over from a stale copy — would otherwise go down
 * with the original and leave its slot silent. Moving it onto the converted file before the
 * delete is what makes throwing the originals out safe by construction.
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

  // One at a time rather than all at once: a pack can hold a hundred of these, and a hundred
  // concurrent deletes buys nothing over a directory that is being rewritten anyway.
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
