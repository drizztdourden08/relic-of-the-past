/* @layer site-kit @kind logic */
import { errorMessage } from '../../api/api-error';
import { withJobLock } from '../job-lock';
import { runJob } from '../run-job';
import { dropRecord } from '../upload-records';
import { failSteps } from '../upload-steps';
import type { LiveJob } from '../live-job.type';
import type { QueueContext } from './queue-parts.type';

const createJobPump = <T, R>(context: QueueContext<T, R>) => {
  const { runner, state, lives, emit } = context;
  const close = async (live: LiveJob<T>, abortServer = true) => {
    const { record } = live;
    if (record.resume && abortServer) await runner.bind(record.target, record.resume).abort().catch(() => undefined);
    await live.stored;
    await dropRecord(record.id);
  };

  const forget = (id: string) => {
    lives.delete(id);
    state.remove(new Set([id]));
  };

  const discard = (live: LiveJob<T>) => {
    forget(live.record.id);
    void close(live);
  };

  const fail = (live: LiveJob<T>, error: unknown) => {
    const completing = state.job(live.record.id)?.phase === 'verifying';
    state.patch(live.record.id, (job) => ({
      phase: 'failed', error: errorMessage(error), steps: failSteps(job.steps), bytesPerSecond: null, msLeft: null,
    }));
    void close(live, !completing);
  };

  const launch = (live: LiveJob<T>) => {
    const controller = new AbortController();
    live.controller = controller;
    const { id } = live.record;
    void withJobLock(id, () => runJob({ runner, live, state, emit, signal: controller.signal }))
      .then((ran) => (ran ? undefined : forget(id)))
      .catch((error: unknown) => (live.cancelled ? undefined : fail(live, error)))
      .finally(() => {
        live.controller = null;
        if (live.cancelled) discard(live);
        pump();
      });
  };

  const pump = () => {
    let busy = [...lives.values()].some((live) => live.controller !== null && live.record.file !== null);
    const queuedOldestFirst = state.get().jobs.filter((job) => job.phase === 'queued').reverse();
    for (const job of queuedOldestFirst) {
      const live = lives.get(job.id);
      if (!live || live.controller) continue;
      if (live.record.file) {
        if (busy) continue;
        busy = true;
      }
      launch(live);
    }
  };

  return { pump, discard };
};

export { createJobPump };
