/* @layer renderer-components @kind hook */
/**
 * Reads a dropped `.msul` back into a pack of its own — the inverse of the export above it.
 *
 * The install itself lives in lib/msu/import/install-msul-pack, shared with the desktop
 * file-association path, so an opened pack and a dropped one land identically.
 */
import { useCallback } from 'react';
import { installMsulPack } from '@app/lib/msu/import/install-msul-pack';
import { publishImportProgress } from '@app/lib/storage/import-progress-bus';
import { stemOf } from './track-file-name';
import { failure } from './usePackList';
import type { ActionResult } from '../msu.type';

interface PackImportParams {
  refresh: () => Promise<void>;
  onImported: (pack: string) => void;
}

const isMsulName = (fileName: string): boolean => /\.msul$/i.test(fileName);

const usePackImport = (params: PackImportParams) => {
  const { refresh, onImported } = params;

  const importMsul = useCallback(async (file: File, desiredName: string): Promise<ActionResult> => {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await installMsulPack(bytes, desiredName || stemOf(file.name));
      await refresh();
      onImported(result.pack);
      // A pack that lists more than it holds is worth saying at once, by name, while the source
      // archive is still to hand.
      const missing = result.missingFiles.length > 0
        ? ` — the archive was missing ${result.missingFiles.length}: ${result.missingFiles.join(', ')}`
        : '';
      return { success: true, message: `Imported "${result.pack}" — ${result.fileCount} files, ${result.trackCount} slots${missing}` };
    } catch (err) {
      const outcome = failure(err, 'Could not read that pack');
      publishImportProgress({ kind: 'msu', id: 'msu', phase: 'error', message: outcome.message });
      return outcome;
    }
  }, [refresh, onImported]);

  return { importMsul, isMsulName };
};

export { usePackImport, isMsulName };
export type { PackImportParams };
