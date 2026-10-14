/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import * as msuStore from '@app/storage/msu-store';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';

const useFileDeletion = (
  selected: string | null,
  reload: () => void,
  report: (action: Promise<ActionResult>) => Promise<ActionResult>,
) => {
  const deleteFile = useCallback(async (fileName: string): Promise<ActionResult> => {
    if (!selected) return { success: false, message: 'No pack selected' };
    try {
      await msuStore.deleteMsuTrackFile(selected, fileName);
      return { success: true, message: `Deleted "${fileName}"` };
    } catch (err) {
      return failure(err, 'Could not delete that file');
    } finally {
      reload();
    }
  }, [selected, reload]);

  return useCallback((fileName: string) => {
    void report(deleteFile(fileName));
  }, [deleteFile, report]);
};

export { useFileDeletion };
