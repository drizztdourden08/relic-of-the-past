/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useT } from '@drizztdourden08/brock-react';
import { NO_USES } from '../MsuFilePanel.constants';
import type { FileConfirmsParams } from './file-confirms.type';

const useFileConfirms = (params: FileConfirmsParams) => {
  const { usage, covered, onDeleteConfirm, deleteFile, report } = params;
  const t = useT();

  const confirmDelete = useCallback((fileName: string) => {
    const uses = usage.get(fileName) ?? NO_USES;
    const message = uses.length > 0
      ? t('msu-studio:files.delete.message-used', { name: fileName, uses: uses.join(', ') })
      : t('msu-studio:files.delete.message', { name: fileName });
    onDeleteConfirm(t('msu-studio:files.delete.title'), message, () => { deleteFile(fileName); });
  }, [t, usage, onDeleteConfirm, deleteFile]);

  const confirmRemoveSuperseded = useCallback(() => {
    const doomed = [...covered.superseded];
    const named = doomed.filter((name) => (usage.get(name) ?? NO_USES).length > 0).length;
    const values = { count: doomed.length, size: formatBytes(covered.totalBytes), named };
    onDeleteConfirm(
      t('msu-studio:files.superseded.title'),
      named > 0 ? t('msu-studio:files.superseded.message-named', values) : t('msu-studio:files.superseded.message', values),
      () => { void covered.removeAll().then(report); },
    );
  }, [t, covered, usage, onDeleteConfirm, report]);

  return { confirmDelete, confirmRemoveSuperseded };
};

export { useFileConfirms };
