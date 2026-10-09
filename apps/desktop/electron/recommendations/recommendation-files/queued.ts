/* @layer electron-main @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { recommendationQueues } from './recommendation-queues';

const queued = <T>(kind: EntityKind, task: () => Promise<T>): Promise<T> => {
  const previous = recommendationQueues.get(kind) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(task);
  recommendationQueues.set(kind, next);
  return next;
};

export { queued };
