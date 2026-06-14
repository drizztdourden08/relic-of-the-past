/* @layer renderer-other @kind hook */
/**
 * Subscribes to the main-process `import:progress` event and reduces the stream
 * for one import `kind` (rom / msu / language / sprite) to a simple state the
 * spinner / progress bar can render. Determinate (`percent`) when loaded+total
 * are present, indeterminate otherwise.
 */
import { useEffect, useState } from 'react';
import type { ImportProgress } from '@shared/ipc';
import { formatBytes } from '@app/utils/formatBytes';

type ImportKind = ImportProgress['kind'];
type ImportPhase = ImportProgress['phase'];

interface ImportProgressState {
  active: boolean;
  phase: ImportPhase | null;
  percent: number | null;
  label: string;
}

const IDLE: ImportProgressState = { active: false, phase: null, percent: null, label: '' };

const PHASE_VERB: Record<ImportPhase, string> = {
  download: 'Downloading',
  extract: 'Extracting',
  copy: 'Copying',
  decode: 'Processing',
  done: 'Done',
  error: 'Error',
};

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
  return percent != null ? verb : `${verb}…`;
};

const useImportProgress = (kind: ImportKind): ImportProgressState => {
  const [state, setState] = useState<ImportProgressState>(IDLE);

  useEffect(() => {
    const unsubscribe = window.api.onImportProgress((progress) => {
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
