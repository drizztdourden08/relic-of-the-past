/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as msuStore from '@app/storage/msu-store';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';

const useFileDeletion = (
  selected: string | null,
  reload: () => void,
  report: (action: Promise<ActionResult>) => Promise<ActionResult>,
) => {
  const t = useT();
  const deleteFile = useCallback(async (fileName: string): Promise<ActionResult> => {
    if (!selected) return { success: false, message: t('msu-studio:pack.none-selected') };
    try {
      await msuStore.deleteMsuTrackFile(selected, fileName);
      return { success: true, message: t('msu-studio:files.status.deleted', { name: fileName }) };
    } catch (err) {
      return failure(err, t('msu-studio:files.error.delete'));
    } finally {
      reload();
    }
  }, [t, selected, reload]);

  return useCallback((fileName: string) => {
    void report(deleteFile(fileName));
  }, [deleteFile, report]);
};

export { useFileDeletion };
