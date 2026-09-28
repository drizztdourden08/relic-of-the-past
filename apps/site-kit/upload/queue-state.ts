/* @layer site-kit @kind logic */
/**
 * The queue's observable state, outside React: an immutable snapshot of the jobs and the
 * open dialog, replaced on every change, and the listeners told about it. The tray and the
 * dialog read it through useSyncExternalStore, so a job outlives the page that started it.
 */
import type { UploadJob } from './upload-job.type';
import type { QueueSnapshot } from './upload-queue.type';

type JobChange = Partial<UploadJob> | ((job: UploadJob) => Partial<UploadJob>);

const newestFirst = (a: UploadJob, b: UploadJob) => b.createdAt - a.createdAt;

const createQueueState = () => {
  let snapshot: QueueSnapshot = { jobs: [], openId: null };
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const get = () => snapshot;

  const update = (change: (current: QueueSnapshot) => QueueSnapshot) => {
    snapshot = change(snapshot);
    for (const listener of listeners) listener();
  };

  const job = (id: string): UploadJob | null => snapshot.jobs.find((entry) => entry.id === id) ?? null;

  const insert = (added: UploadJob) => update((current) => ({ ...current, jobs: [...current.jobs, added].sort(newestFirst) }));

  const patch = (id: string, change: JobChange) => update((current) => ({
    ...current,
    jobs: current.jobs.map((entry) => (entry.id === id ? { ...entry, ...(typeof change === 'function' ? change(entry) : change) } : entry)),
  }));

  const remove = (ids: ReadonlySet<string>) => update((current) => ({
    jobs: current.jobs.filter((entry) => !ids.has(entry.id)),
    openId: current.openId !== null && ids.has(current.openId) ? null : current.openId,
  }));

  const open = (id: string | null) => update((current) => ({ ...current, openId: id }));

  return { subscribe, get, job, insert, patch, remove, open };
};

type QueueState = ReturnType<typeof createQueueState>;

export { createQueueState };
export type { QueueState, JobChange };
