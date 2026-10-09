/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { installMsulFile } from '@app/storage/msu-store';
import { publishImportProgress } from '@app/storage/import-progress-bus';
import { stemOf } from './track-file-name';
import { failure } from './failure';
import { isMsulName } from './is-msul-name';
import type { ActionResult } from '../msu.type';
import type { PackImportParams } from './usePackImport.type';

const usePackImport = (params: PackImportParams) => {
  const { refresh, onImported } = params;

  const importMsul = useCallback(async (file: File, desiredName: string): Promise<ActionResult> => {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await installMsulFile(bytes, desiredName || stemOf(file.name));
      await refresh();
      onImported(result.pack);
      const missing = result.missingFiles.length > 0
        ? `. The archive was missing ${result.missingFiles.length}: ${result.missingFiles.join(', ')}`
        : '';
      return { success: true, message: `Imported "${result.pack}" with ${result.fileCount} files and ${result.trackCount} slots${missing}` };
    } catch (err) {
      const outcome = failure(err, 'Could not read that pack');
      publishImportProgress({ kind: 'msu', id: 'msu', phase: 'error', message: outcome.message });
      return outcome;
    }
  }, [refresh, onImported]);

  return { importMsul, isMsulName };
};

export { usePackImport };
