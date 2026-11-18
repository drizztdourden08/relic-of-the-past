/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as msuStore from '@app/storage/msu-store';
import { sanitizeFileName, uniqueFileName } from './track-file-name';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';
import type { SoundUploadParams } from './sound-upload.type';

const useSoundUpload = (params: SoundUploadParams) => {
  const { pack, files, reload } = params;
  const t = useT();
  const [busy, setBusy] = useState(false);

  const upload = useCallback(async (dropped: File[]): Promise<ActionResult> => {
    if (!pack) return { success: false, message: t('msu-studio:pack.none-selected') };
    if (dropped.length === 0) return { success: false, message: t('msu-studio:upload.none') };

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
      return { success: true, message: t('msu-studio:upload.added', { count: written.length }) };
    } catch (err) {
      return failure(err, t('msu-studio:upload.error'));
    } finally {
      setBusy(false);
      reload();
    }
  }, [t, pack, files, reload]);

  return { upload, uploading: busy };
};

export { useSoundUpload };
