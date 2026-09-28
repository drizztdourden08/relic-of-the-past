/* @layer site-kit @kind logic */
/**
 * A site's upload queue, one per site and outside React (an observer the tray, the dialog
 * and the site's lists subscribe to). One job with a file runs at a time and the others
 * wait as queued; a job made of the site's own steps only runs at once. A job that fails
 * or is cancelled closes its server record and drops its browser record; a finished one
 * stays in the tray until dismissed.
 */
import { errorMessage } from '../api/api-error';
import { formatBytes } from '../lib/format-bytes';
import { withJobLock } from './job-lock';
import { isSameFile, jobOf, recordOf } from './job-of';
import { createQueueState } from './queue-state';
import { restoreJobs } from './restore-jobs';
import { runFollowUp } from './run-follow-up';
import { runJob } from './run-job';
import { dropRecord, keepFile, saveRecord } from './upload-records';
import { failSteps } from './upload-steps';
import type { LiveJob } from './live-job.type';
import type { UploadJob } from './upload-job.type';
import type { UploadQueue } from './upload-queue.type';
import type { UploadRunner } from './upload-runner.type';

const isFinished = (job: UploadJob) => job.phase === 'done' || job.phase === 'failed';

const createUploadQueue = <T, R>(runner: UploadRunner<T, R>): UploadQueue<T, R> => {
  const state = createQueueState();
  const lives = new Map<string, LiveJob<T>>();
  const listeners = new Set<(record: R) => void>();
  const emit = (record: R) => {
    for (const listener of listeners) listener(record);
  };
  let restoring: Promise<void> | null = null;

  /**
   * Closes the server record (when one was opened and may still be open) and drops the
   * browser's. A job that failed while completing is left open: the server may have
   * finished it, and the daily job clears an upload that never did.
   */
  const close = async (live: LiveJob<T>, abortServer = true) => {
    const { record } = live;
    if (record.resume && abortServer) await runner.bind(record.target, record.resume).abort().catch(() => undefined);
    await live.stored;
    await dropRecord(record.id);
  };

  /** Forgets a job here only: another tab is running it. */
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

  /** Starts every queued job that may run now, oldest first. */
  const pump = () => {
    let busy = [...lives.values()].some((live) => live.controller !== null && live.record.file !== null);
    const queued = state.get().jobs.filter((job) => job.phase === 'queued').reverse();
    for (const job of queued) {
      const live = lives.get(job.id);
      if (!live || live.controller) continue;
      if (live.record.file) {
        if (busy) continue;
        busy = true;
      }
      launch(live);
    }
  };

  const keepCopy = (id: string, file: Blob) => keepFile(id, file).then((kept) => {
    if (kept && lives.has(id)) state.patch(id, { fileKept: true });
  });

  const add = (target: T, file: File | null): string => {
    const record = recordOf(runner, target, file);
    const { id } = record;
    if (file && file.size > runner.maxBytes) {
      state.insert({ ...jobOf(record, 'failed'), error: `Larger than ${formatBytes(runner.maxBytes)}.` });
      return id;
    }
    const stored = Promise.all([saveRecord(record), file ? keepCopy(id, file) : null]);
    lives.set(id, { record, file, controller: null, cancelled: false, stored });
    state.insert(jobOf(record, 'queued'));
    pump();
    return id;
  };

  const start = (files: File[], target: T) => runner.pick(files, target).map((file) => add(target, file));

  const cancel = (id: string) => {
    const live = lives.get(id);
    if (!live) return;
    live.cancelled = true;
    if (live.controller) live.controller.abort(new Error('The upload was cancelled.'));
    else discard(live);
  };

  const dismiss = (id: string) => {
    lives.delete(id);
    state.remove(new Set([id]));
  };

  const clearFinished = () => {
    const ids = new Set(state.get().jobs.filter(isFinished).map((job) => job.id));
    for (const id of ids) lives.delete(id);
    state.remove(ids);
  };

  const pickFile = (id: string, file: File) => {
    const live = lives.get(id);
    const facts = live?.record.file;
    if (!live || !facts) return;
    if (!isSameFile(facts, file)) {
      state.patch(id, { error: `That is a different file. Pick ${facts.name}.` });
      return;
    }
    live.file = file;
    live.stored = keepCopy(id, file);
    state.patch(id, { phase: 'queued', error: null });
    pump();
  };

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

export { createUploadQueue, isFinished };
