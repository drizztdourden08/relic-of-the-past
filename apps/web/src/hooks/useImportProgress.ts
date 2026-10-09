/* @layer renderer-other @kind hook */
import { useEffect, useState } from 'react';
import type { ImportProgress } from '@shared/ipc';
import { formatBytes } from '@app/utils/formatBytes';
import { subscribeImportProgress } from '@app/lib/storage/import-progress-bus';
import type { ImportKind, ImportProgressState } from './use-import-progress.type';
import { IDLE, PHASE_VERB } from './use-import-progress.constants';

const buildLabel = (progress: ImportProgress, percent: number | null): string => {
  const { phase, loaded, total, message } = progress;
  if (message) return message;
  const verb = PHASE_VERB[phase];
  if (phase === 'download' && loaded != null) {
    return total ? `${verb} ${formatBytes(loaded)} / ${formatBytes(total)}` : `${verb} ${formatBytes(loaded)}`;
  }
  if ((phase === 'copy' || phase === 'extract') && loaded != null && total != null) {
    return `${verb} ${loaded} / ${total}`;
  }
  return percent != null ? verb : `${verb}...`;
};

const useImportProgress = (kind: ImportKind): ImportProgressState => {
  const [state, setState] = useState<ImportProgressState>(IDLE);

  useEffect(() => {
    const unsubscribe = subscribeImportProgress((progress) => {
      if (progress.kind !== kind) return;
      if (progress.phase === 'done') { setState(IDLE); return; }
      if (progress.phase === 'error') {
        setState({ active: false, phase: 'error', percent: null, label: progress.message ?? 'Error' });
        return;
      }
      const percent = (progress.loaded != null && progress.total) ? Math.min(100, (progress.loaded / progress.total) * 100) : null;
      setState({ active: true, phase: progress.phase, percent, label: buildLabel(progress, percent) });
    });
    return unsubscribe;
  }, [kind]);

  return state;
};

export { useImportProgress };
export type { ImportProgressState, ImportKind };
