/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as msuStore from '@app/storage/msu-store';
import { withTrackFile } from './pack-manifest';
import { parkFile } from './park-file';
import { canonicalTrackName, extensionOf, namePrefixOf, uniqueFileName } from './track-file-name';
import { failure } from './failure';
import { getTrackNumber } from './get-track-number';
import type { ActionResult } from '../msu.type';
import type { TrackAssignParams } from './track-assign.type';

const useTrackAssign = (params: TrackAssignParams) => {
  const { pack, format, manifest, files, reload } = params;
  const t = useT();
  const [busy, setBusy] = useState(false);

  const assignClassic = useCallback(async (trackNum: number, fileName: string): Promise<ActionResult> => {
    if (!pack) return { success: false, message: t('msu-studio:pack.none-selected') };
    const names = files.map((f) => f.name);
    const taken = new Set(names);
    const occupant = names.find((n) => n !== fileName && getTrackNumber(n) === trackNum);
    const number = trackNum;

    if (!fileName) {
      if (!occupant) return { success: true, message: t('msu-studio:track.assign.already-empty', { number }) };
      const parked = await parkFile(pack, occupant, taken);
      return { success: true, message: t('msu-studio:track.assign.cleared-parked', { number, parked }) };
    }

    const target = canonicalTrackName(namePrefixOf(names, pack), trackNum, extensionOf(fileName));
    if (!occupant) {
      if (fileName === target) return { success: true, message: t('msu-studio:track.assign.already-fills', { number, name: fileName }) };
      await msuStore.renameMsuTrackFile(pack, fileName, target);
      return { success: true, message: t('msu-studio:track.assign.now-plays', { number, name: target }) };
    }
    if (fileName === target) {
      const parked = await parkFile(pack, occupant, taken);
      return {
        success: true,
        message: t('msu-studio:track.assign.moved-aside', { number, name: fileName, occupant, parked }),
      };
    }
    const hold = uniqueFileName(`swap.${extensionOf(occupant)}`, taken);
    await msuStore.renameMsuTrackFile(pack, occupant, hold);
    await msuStore.renameMsuTrackFile(pack, fileName, target);
    await msuStore.renameMsuTrackFile(pack, hold, fileName);
    return { success: true, message: t('msu-studio:track.assign.swapped', { number, target, name: fileName }) };
  }, [t, pack, files]);

  const assign = useCallback(async (trackNum: number, fileName: string): Promise<ActionResult> => {
    if (!pack) return { success: false, message: t('msu-studio:pack.none-selected') };
    setBusy(true);
    try {
      if (format === 'layered') {
        await msuStore.writeMsuManifest(pack, withTrackFile(manifest, trackNum, fileName || null));
        return {
          success: true,
          message: fileName
            ? t('msu-studio:track.assign.now-plays', { number: trackNum, name: fileName })
            : t('msu-studio:track.assign.cleared', { number: trackNum }),
        };
      }
      return await assignClassic(trackNum, fileName);
    } catch (err) {
      return failure(err, t('msu-studio:track.assign.error'));
    } finally {
      setBusy(false);
      reload();
    }
  }, [t, pack, format, manifest, assignClassic, reload]);

  return { assign, assigning: busy };
};

export { useTrackAssign };
