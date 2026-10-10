/* @layer site-kit @kind logic */
import { createQueueState } from '../queue-state';
import { restoreJobs } from '../restore-jobs';
import { runFollowUp } from '../run-follow-up';
import type { LiveJob } from '../live-job.type';
import type { UploadQueue } from '../upload-queue.type';
import type { UploadRunner } from '../upload-runner.type';
import { createJobIntake } from './create-job-intake';
import { createJobPump } from './create-job-pump';
import { createJobRemoval } from './create-job-removal';

const createUploadQueue = <T, R>(runner: UploadRunner<T, R>): UploadQueue<T, R> => {
  const state = createQueueState();
  const lives = new Map<string, LiveJob<T>>();
  const listeners = new Set<(record: R) => void>();
  const emit = (record: R) => {
    for (const listener of listeners) listener(record);
  };
  let restoring: Promise<void> | null = null;

  const { pump, discard } = createJobPump({ runner, state, lives, emit });
  const { add, start, pickFile } = createJobIntake({ runner, state, lives, pump });
  const { cancel, dismiss, clearFinished } = createJobRemoval({ state, lives, discard });

  const followUp = (id: string) => {
    const live = lives.get(id);
    if (live) void runFollowUp({ runner, live, state, emit });
  };

  const restore = () => {
    restoring ??= restoreJobs({ runner, state, lives }).then(pump);
    return restoring;
  };

  const onRecord = (listener: (record: R) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    subscribe: state.subscribe,
    getSnapshot: state.get,
    restore,
    cancel,
    dismiss,
    clearFinished,
    pickFile,
    open: state.open,
    followUp,
    followUpLabel: runner.followUp?.label ?? null,
    add,
    start,
    onRecord,
  };
};

export { createUploadQueue };
