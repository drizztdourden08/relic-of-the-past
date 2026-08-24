/* @layer renderer-components @kind hook */
/**
 * Drops audio into the pack without claiming a slot.
 *
 * A sound's layers pick from every file in the pack, so an upload here only has to land the
 * bytes under a safe, unused name. That is why this is not the track upload with a flag: all of
 * that hook's weight is the canonical `<prefix><n>.<ext>` naming a classic music slot depends on,
 * and a sound has no slot to name a file after.
 */
import { useCallback, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import { sanitizeFileName, uniqueFileName } from './track-file-name';
import { failure } from './usePackList';
import type { ActionResult, MsuFile } from '../msu.type';

interface SoundUploadParams {
  pack: string | null;
  files: MsuFile[];
  reload: () => void;
}

const useSoundUpload = (params: SoundUploadParams) => {
  const { pack, files, reload } = params;
  const [busy, setBusy] = useState(false);

  const upload = useCallback(async (dropped: File[]): Promise<ActionResult> => {
    if (!pack) return { success: false, message: 'No pack selected' };
    if (dropped.length === 0) return { success: false, message: 'No audio file selected' };

    const taken = new Set(files.map((file) => file.name));
    setBusy(true);
    try {
      const written: string[] = [];
      for (const file of dropped) {
        const name = uniqueFileName(sanitizeFileName(file.name), taken);
        await msuStore.writeMsuTrackFile(pack, name, await file.arrayBuffer());
        taken.add(name);
        written.push(name);
      }
      const plural = written.length === 1 ? '' : 's';
      return { success: true, message: `Added ${written.length} file${plural} to the pack` };
    } catch (err) {
      return failure(err, 'Could not add that audio');
    } finally {
      setBusy(false);
      reload();
    }
  }, [pack, files, reload]);

  return { upload, uploading: busy };
};

export { useSoundUpload };
export type { SoundUploadParams };
