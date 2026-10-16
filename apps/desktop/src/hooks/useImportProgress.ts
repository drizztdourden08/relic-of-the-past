/* @layer renderer-other @kind hook */
import { useMemo } from 'react';
import { useJob } from '@drizztdourden08/brock-react';
import { importJobId } from '@app/storage/import-job';
import { progressStateOf } from './progress-state-of';
import type { ImportKind, ImportProgressState } from './use-import-progress.type';

const useImportProgress = (kind: ImportKind): ImportProgressState => {
  const { job } = useJob(importJobId(kind));
  return useMemo(() => progressStateOf(job), [job]);
};

export { useImportProgress };
export type { ImportProgressState, ImportKind };
