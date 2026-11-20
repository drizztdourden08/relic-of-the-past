/* @layer renderer-lib @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { ImportKind, ImportPhase } from './import-job.type';

const PHASE_LINE: Record<ImportPhase, Text> = {
  download: msg('data-manager:jobs.line.download'),
  extract: msg('data-manager:jobs.line.extract'),
  copy: msg('data-manager:jobs.line.copy'),
  decode: msg('data-manager:jobs.line.decode'),
};

const importJobId = (kind: ImportKind): string => `import:${kind}`;

export { importJobId, PHASE_LINE };
