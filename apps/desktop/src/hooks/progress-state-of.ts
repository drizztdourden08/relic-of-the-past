/* @layer renderer-other @kind logic */
import type { JobSnapshot } from '@drizztdourden08/brock-core/types';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { IDLE } from './use-import-progress.constants';
import type { ImportProgressState } from './use-import-progress.type';

const progressStateOf = (job: JobSnapshot | null, text: (value: Text) => string): ImportProgressState => {
  if (job?.state !== 'running') return IDLE;
  const percent = job.stepProgress > 0 ? Math.min(100, job.stepProgress * 100) : null;
  return { active: true, percent, label: job.line ?? text(job.title) };
};

export { progressStateOf };
