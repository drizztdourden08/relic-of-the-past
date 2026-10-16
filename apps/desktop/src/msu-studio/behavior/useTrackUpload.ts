/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import * as msuStore from '@app/storage/msu-store';
import { runImportJob } from '@app/storage/import-job';
import { withTrackFilesAdded } from './pack-manifest';
import { namePrefixOf } from './track-file-name';
import { failure } from './failure';
import { writeDroppedFiles } from './write-dropped-files';
import type { ActionResult } from '../msu.type';
import type { TrackUploadParams } from './track-upload.type';

const useTrackUpload = (params: TrackUploadParams) => {
  const { pack, format, manifest, files, reload } = params;
  const [busy, setBusy] = useState(false);

  const upload = useCallback(async (trackNum: number, dropped: File[]): Promise<ActionResult> => {
    if (!pack) return { success: false, message: 'No pack selected' };
    if (dropped.length === 0) return { success: false, message: 'No audio file selected' };

    const taken = new Set(files.map((f) => f.name));
    const prefix = namePrefixOf([...taken], pack);
    setBusy(true);
    try {
      const written = await runImportJob({
        kind: 'msu',
        title: 'Adding audio',
        work: async (report) => {
          const added = await writeDroppedFiles({
            pack, trackNum, dropped, format, taken, prefix, onCopied: (done, total) => report.count('copy', done, total),
          });
          if (format === 'layered') await msuStore.writeMsuManifest(pack, withTrackFilesAdded(manifest, trackNum, added));
          return added;
        },
      });
      return { success: true, message: `Added ${written.length} file${written.length === 1 ? '' : 's'} to slot ${trackNum}` };
    } catch (err) {
      return failure(err, 'Could not add that audio');
    } finally {
      setBusy(false);
      reload();
    }
  }, [pack, format, manifest, files, reload]);

  return { upload, uploading: busy };
};

export { useTrackUpload };
