/* @layer site-kit @kind logic */
import { isJobLocked } from './job-lock';
import { jobOf } from './job-of';
import { readKeptFile, readRecords } from './upload-records';
import { restoreSteps } from './upload-steps';
import type { RestoreParams } from './restore-jobs.type';

const restoreJobs = async <T, R>(params: RestoreParams<T, R>): Promise<void> => {
  const { runner, state, lives } = params;
  const records = await readRecords<T>(runner.site);
  for (const stored of records) {
    if (lives.has(stored.id) || await isJobLocked(stored.id)) continue;
    const file = stored.file ? await readKeptFile(stored.id) : null;
    const record = { ...stored, steps: restoreSteps(stored.steps) };
    const phase = !record.file || file ? 'queued' : 'needs-file';
    lives.set(record.id, { record, file, controller: null, cancelled: false, stored: Promise.resolve() });
    state.insert(jobOf(record, phase, file !== null));
  }
};

export { restoreJobs };
