/* @layer renderer-other @kind constants */
import type { ImportPhase, ImportProgressState } from './use-import-progress.type';

const IDLE: ImportProgressState = { active: false, phase: null, percent: null, label: '' };

const PHASE_VERB: Record<ImportPhase, string> = {
  download: 'Downloading',
  extract: 'Extracting',
  copy: 'Copying',
  decode: 'Processing',
  done: 'Done',
  error: 'Error',
};

export { IDLE, PHASE_VERB };
