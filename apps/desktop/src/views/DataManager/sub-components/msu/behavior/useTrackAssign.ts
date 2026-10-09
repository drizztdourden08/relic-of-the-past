/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import * as msuStore from '@app/storage/msu-store';
import { withTrackFile } from './pack-manifest';
import { parkFile } from './park-file';
import { canonicalTrackName, extensionOf, namePrefixOf, uniqueFileName } from './track-file-name';
import { failure } from './failure';
import { getTrackNumber } from './get-track-number';
import type { ActionResult } from '../msu.type';
import type { TrackAssignParams } from './useTrackAssign.type';

const useTrackAssign = (params: TrackAssignParams) => {
  const { pack, format, manifest, files, reload } = params;
  const [busy, setBusy] = useState(false);

  const assignClassic = useCallback(async (trackNum: number, fileName: string): Promise<ActionResult> => {
    if (!pack) return { success: false, message: 'No pack selected' };
    const names = files.map((f) => f.name);
    const taken = new Set(names);
    const occupant = names.find((n) => n !== fileName && getTrackNumber(n) === trackNum);

    if (!fileName) {
      if (!occupant) return { success: true, message: `Slot ${trackNum} was already empty` };
      const parked = await parkFile(pack, occupant, taken);
      return { success: true, message: `Slot ${trackNum} cleared. The audio is still in the pack as "${parked}"` };
    }

    const target = canonicalTrackName(namePrefixOf(names, pack), trackNum, extensionOf(fileName));
    if (!occupant) {
      if (fileName === target) return { success: true, message: `"${fileName}" already fills slot ${trackNum}` };
      await msuStore.renameMsuTrackFile(pack, fileName, target);
      return { success: true, message: `Slot ${trackNum} now plays "${target}"` };
    }
    if (fileName === target) {
      const parked = await parkFile(pack, occupant, taken);
      return { success: true, message: `Slot ${trackNum} now plays "${fileName}". "${occupant}" moved aside as "${parked}"` };
    }
    const hold = uniqueFileName(`swap.${extensionOf(occupant)}`, taken);
    await msuStore.renameMsuTrackFile(pack, occupant, hold);
    await msuStore.renameMsuTrackFile(pack, fileName, target);
    await msuStore.renameMsuTrackFile(pack, hold, fileName);
    return { success: true, message: `Slot ${trackNum} now plays "${target}"; the file it replaced is now "${fileName}"` };
  }, [pack, files]);

  const assign = useCallback(async (trackNum: number, fileName: string): Promise<ActionResult> => {
    if (!pack) return { success: false, message: 'No pack selected' };
    setBusy(true);
    try {
      if (format === 'layered') {
        await msuStore.writeMsuManifest(pack, withTrackFile(manifest, trackNum, fileName || null));
        return { success: true, message: fileName ? `Slot ${trackNum} now plays "${fileName}"` : `Slot ${trackNum} cleared` };
      }
      return await assignClassic(trackNum, fileName);
    } catch (err) {
      return failure(err, 'Could not change that slot');
    } finally {
      setBusy(false);
      reload();
    }
  }, [pack, format, manifest, assignClassic, reload]);

  return { assign, assigning: busy };
};

export { useTrackAssign };
