/* @layer electron-main @kind logic */
/**
 * Path resolution + raw read/write for the review layer's one-file-per-kind
 * store (`Data/review/<kind>.json`), the same `getUserDataPath` root the
 * legacy `connection-review.json`/`nav-review.json`/`sprite-review.json`
 * resolve from, just under its own `review/` subfolder.
 *
 * Writes for the same kind are serialized behind a per-kind queue: the
 * renderer's debounce is per (kind, id), so two different ids in one
 * collection can each fire their own `review:save` call moments apart, and an
 * unserialized read-modify-write would let the second call's read miss the
 * first call's not-yet-flushed write and clobber it on save.
 */
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';
import type { EntityKind } from '@shared/game/data';
import type { ReviewEntry, ReviewFile } from '@shared/game/review/types';

const writeQueues = new Map<EntityKind, Promise<unknown>>();

const reviewFilePath = (kind: EntityKind): string => getUserDataPath('review', `${kind}.json`);

const loadReviewFile = (kind: EntityKind): Promise<ReviewFile> =>
  readJson(reviewFilePath(kind), {});

/** Read-modify-write of a single entry, queued behind any write already pending for this kind. */
const saveReviewEntry = (kind: EntityKind, id: string, entry: ReviewEntry): Promise<void> => {
  const previous = writeQueues.get(kind) ?? Promise.resolve();
  const task = previous.catch(() => {}).then(async () => {
    const file = await loadReviewFile(kind);
    file[id] = entry;
    await writeJson(reviewFilePath(kind), file);
  });
  writeQueues.set(kind, task);
  return task;
};

export { loadReviewFile, reviewFilePath, saveReviewEntry };
