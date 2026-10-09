/* @layer site-kit @kind types */
import type { LiveJob } from './live-job.type';
import type { QueueState } from './queue-state.type';
import type { UploadRunner } from './upload-runner.type';

type RunJobParams<T, R> = {
  runner: UploadRunner<T, R>;
  live: LiveJob<T>;
  state: QueueState;
  emit: (record: R) => void;
  signal: AbortSignal;
};

export type { RunJobParams };
