/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { formatBytes } from '@drizztdourden08/brock-core';
import { NO_USES } from '../MsuFilePanel.constants';
import type { FileConfirmsParams } from './file-confirms.type';

const useFileConfirms = (params: FileConfirmsParams) => {
  const { usage, covered, onDeleteConfirm, deleteFile, report } = params;

  const confirmDelete = useCallback((fileName: string) => {
    const uses = usage.get(fileName) ?? NO_USES;
    const played = uses.length > 0 ? ` ${uses.join(', ')} will be left with nothing to play.` : '';
    onDeleteConfirm(
      'Delete Audio File',
      `Delete "${fileName}" from this pack? This cannot be undone.${played}`,
      () => { deleteFile(fileName); },
    );
  }, [usage, onDeleteConfirm, deleteFile]);

  const confirmRemoveSuperseded = useCallback(() => {
    const doomed = [...covered.superseded];
    const stillNamed = doomed.filter((name) => (usage.get(name) ?? NO_USES).length > 0);
    const played = stillNamed.length > 0
      ? ` ${stillNamed.length} of them ${stillNamed.length === 1 ? 'is' : 'are'} still named by a slot or sound, which will play the converted file instead.`
      : '';
    onDeleteConfirm(
      'Remove Superseded Originals',
      `Delete ${doomed.length} original file${doomed.length === 1 ? '' : 's'} the pack already holds in the`
      + ` converted format? This frees ${formatBytes(covered.totalBytes)} and cannot be undone.${played}`,
      () => { void covered.removeAll().then(report); },
    );
  }, [covered, usage, onDeleteConfirm, report]);

  return { confirmDelete, confirmRemoveSuperseded };
};

export { useFileConfirms };
