/* @layer site-kit @kind logic */
import { isFinished } from './is-finished';
import type { JobRemovalParams } from './queue-parts.type';

const createJobRemoval = <T>(params: JobRemovalParams<T>) => {
  const { state, lives, discard } = params;
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

  return { cancel, dismiss, clearFinished };
};

export { createJobRemoval };
