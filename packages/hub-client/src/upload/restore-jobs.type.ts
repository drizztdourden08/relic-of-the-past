/* @layer site-kit @kind types */
import type { LiveJob } from './live-job.type';
import type { QueueState } from './queue-state.type';
import type { UploadRunner } from './upload-runner.type';

type RestoreParams<T, R> = {
  runner: UploadRunner<T, R>;
  state: QueueState;
  lives: Map<string, LiveJob<T>>;
};

export type { RestoreParams };
