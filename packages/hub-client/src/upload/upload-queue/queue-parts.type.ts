/* @layer site-kit @kind types */
import type { LiveJob } from '../live-job.type';
import type { QueueState } from '../queue-state.type';
import type { UploadRunner } from '../upload-runner.type';

type QueueContext<T, R> = {
  runner: UploadRunner<T, R>;
  state: QueueState;
  lives: Map<string, LiveJob<T>>;
  emit: (record: R) => void;
};

type JobIntakeParams<T, R> = {
  runner: UploadRunner<T, R>;
  state: QueueState;
  lives: Map<string, LiveJob<T>>;
  pump: () => void;
};

type JobRemovalParams<T> = {
  state: QueueState;
  lives: Map<string, LiveJob<T>>;
  discard: (live: LiveJob<T>) => void;
};

export type { QueueContext, JobIntakeParams, JobRemovalParams };
