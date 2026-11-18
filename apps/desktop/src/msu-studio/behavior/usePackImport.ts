/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { installMsulFile } from '@app/storage/msu-store';
import { stemOf } from './track-file-name';
import { failure } from './failure';
import { isMsulName } from './is-msul-name';
import type { ActionResult } from '../msu.type';
import type { PackImportParams } from './pack-import.type';

const usePackImport = (params: PackImportParams) => {
  const { refresh, onImported } = params;
  const t = useT();

  const importMsul = useCallback(async (file: File, desiredName: string): Promise<ActionResult> => {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await installMsulFile(bytes, desiredName || stemOf(file.name));
      await refresh();
      onImported(result.pack);
      const values = { pack: result.pack, files: result.fileCount, slots: result.trackCount };
      const message = result.missingFiles.length > 0
        ? t('msu-studio:import.done-missing', { ...values, missing: result.missingFiles.length, names: result.missingFiles.join(', ') })
        : t('msu-studio:import.done', values);
      return { success: true, message };
    } catch (err) {
      return failure(err, t('msu-studio:import.error'));
    }
  }, [t, refresh, onImported]);

  return { importMsul, isMsulName };
};

export { usePackImport };
