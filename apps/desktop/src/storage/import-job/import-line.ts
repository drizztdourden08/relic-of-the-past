/* @layer renderer-lib @kind logic */
import { formatBytes } from '@drizztdourden08/brock-core';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { PHASE_LINE } from './import-job.constants';
import type { ImportPhase } from './import-job.type';

const importLine = (phase: ImportPhase, loaded: number, total?: number): Text => {
  if (phase === 'download') {
    return total
      ? msg('data-manager:jobs.line.downloadSize', { loaded: formatBytes(loaded), total: formatBytes(total) })
      : msg('data-manager:jobs.line.downloadLoaded', { loaded: formatBytes(loaded) });
  }
  if (total === undefined) return PHASE_LINE[phase];
  if (phase === 'extract') return msg('data-manager:jobs.line.extractCount', { loaded, total });
  if (phase === 'copy') return msg('data-manager:jobs.line.copyCount', { loaded, total });
  return msg('data-manager:jobs.line.decodeCount', { loaded, total });
};

export { importLine };
