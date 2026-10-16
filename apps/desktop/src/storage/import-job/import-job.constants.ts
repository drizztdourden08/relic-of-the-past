/* @layer renderer-lib @kind constants */
import type { ImportKind, ImportPhase } from './import-job.type';

const PHASE_VERB: Record<ImportPhase, string> = {
  download: 'Downloading',
  extract: 'Extracting',
  copy: 'Copying',
  decode: 'Processing',
};

const importJobId = (kind: ImportKind): string => `import:${kind}`;

export { importJobId, PHASE_VERB };
