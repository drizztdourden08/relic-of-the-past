/* @layer renderer-lib @kind logic */
import { formatBytes } from '@drizztdourden08/brock-core';
import { PHASE_VERB } from './import-job.constants';
import type { ImportPhase } from './import-job.type';

const importLine = (phase: ImportPhase, loaded: number, total?: number): string => {
  const verb = PHASE_VERB[phase];
  if (phase === 'download') return total ? `${verb} ${formatBytes(loaded)} / ${formatBytes(total)}` : `${verb} ${formatBytes(loaded)}`;
  return total === undefined ? verb : `${verb} ${loaded} / ${total}`;
};

export { importLine };
