/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import { sanitizeFileName, uniqueFileName } from './track-file-name';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';
import type { SoundUploadParams } from './useSoundUpload.type';

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
