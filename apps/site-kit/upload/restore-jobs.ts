/* @layer site-kit @kind logic */
/**
 * Brings back the jobs a reload cut off, from their IndexedDB records. A job with its file
 * copy kept is queued and continues by itself; one without waits for the author to pick
 * the file again. A job another tab is running now stays with that tab.
 */
import { isJobLocked } from './job-lock';
import { jobOf } from './job-of';
import { readKeptFile, readRecords } from './upload-records';
import { restoreSteps } from './upload-steps';
import type { LiveJob } from './live-job.type';
import type { QueueState } from './queue-state';
import type { UploadRunner } from './upload-runner.type';

type RestoreParams<T, R> = {
  runner: UploadRunner<T, R>;
  state: QueueState;
  lives: Map<string, LiveJob<T>>;
};

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
