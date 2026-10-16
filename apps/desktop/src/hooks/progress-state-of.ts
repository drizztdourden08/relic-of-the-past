/* @layer renderer-other @kind logic */
import type { JobSnapshot } from '@drizztdourden08/brock-core/types';
import { IDLE } from './use-import-progress.constants';
import type { ImportProgressState } from './use-import-progress.type';

const progressStateOf = (job: JobSnapshot | null): ImportProgressState => {
  if (job?.state !== 'running') return IDLE;
  const percent = job.stepProgress > 0 ? Math.min(100, job.stepProgress * 100) : null;
  return { active: true, percent, label: job.line ?? job.title };
};

export { progressStateOf };
