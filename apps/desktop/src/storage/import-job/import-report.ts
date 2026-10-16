/* @layer renderer-lib @kind logic */
import type { JobHandle } from '@drizztdourden08/brock-core/jobs';
import { PHASE_VERB } from './import-job.constants';
import { importLine } from './import-line';
import type { ImportReport } from './import-job.type';

const importReportOf = (job: JobHandle): ImportReport => ({
  phase: (phase, message) => job.progress(0, message ?? `${PHASE_VERB[phase]}...`),
  count: (phase, loaded, total) => job.progress(total ? loaded / total : 0, importLine(phase, loaded, total)),
});

export { importReportOf };
