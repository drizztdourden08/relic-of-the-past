/* @layer renderer-components @kind hook */
/**
 * Drops audio straight into a slot. Nothing is transcoded, so the only decisions are the file's
 * name and what to do with the slot's occupant. Progress goes through the shared import bus.
 */
import { useCallback, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import * as msuStore from '@app/lib/storage/msu-store';
import { publishImportProgress } from '@app/lib/storage/import-progress-bus';
import { withTrackFilesAdded } from './pack-manifest';
import { parkFile } from './park-file';
import { canonicalTrackName, extensionOf, namePrefixOf, sanitizeFileName, uniqueFileName } from './track-file-name';
import { failure } from './usePackList';
import { getTrackNumber } from '../msu.type';
import type { ActionResult, MsuFile, PackFormat } from '../msu.type';

interface TrackUploadParams {
  pack: string | null;
  format: PackFormat;
  manifest: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

const emit = (phase: 'copy' | 'done' | 'error', loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'msu', id: 'msu', phase, loaded, total, message });

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
      const written: string[] = [];
      for (const [index, file] of dropped.entries()) {
        // In a classic pack the first file has to LAND on the slot's own name; extra files, and
        // every file of a layered pack, keep their own names and are wired up by the manifest.
        const claimsSlot = index === 0 && format === 'classic';
        const name = claimsSlot
          ? canonicalTrackName(prefix, trackNum, extensionOf(file.name))
          : uniqueFileName(sanitizeFileName(file.name), taken);
        if (claimsSlot) {
          // Any file already numbered for this slot moves aside, whatever its extension.
          const occupant = [...taken].find((n) => n !== name && getTrackNumber(n) === trackNum);
          if (occupant) await parkFile(pack, occupant, taken);
        }
        await msuStore.writeMsuTrackFile(pack, name, await file.arrayBuffer());
        taken.add(name);
        written.push(name);
        emit('copy', index + 1, dropped.length);
      }
      if (format === 'layered') {
        await msuStore.writeMsuManifest(pack, withTrackFilesAdded(manifest, trackNum, written));
      }
      emit('done');
      return { success: true, message: `Added ${written.length} file${written.length === 1 ? '' : 's'} to slot ${trackNum}` };
    } catch (err) {
      const result = failure(err, 'Could not add that audio');
      emit('error', undefined, undefined, result.message);
      return result;
    } finally {
      setBusy(false);
      reload();
    }
  }, [pack, format, manifest, files, reload]);

  return { upload, uploading: busy };
};

export { useTrackUpload };
export type { TrackUploadParams };
