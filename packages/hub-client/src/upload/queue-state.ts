/* @layer site-kit @kind logic */
import type { UploadJob } from './upload-job.type';
import type { QueueSnapshot } from './upload-queue.type';
import type { JobChange } from './queue-state.type';

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

export { createQueueState };
