/* @layer electron-main @kind logic */
/**
 * The disk adapter behind the recommendation engine's storage PORT
 * (`RecommendationStorage`), one file per collection under the same
 * `getUserDataPath` root the review layer resolves from — `Data/recommendations/
 * <kind>.json`. The relative path comes from `recommendationFile` rather than
 * being spelled again here, so the engine stays the single source of truth for
 * where a collection lives.
 *
 * Same-kind operations are serialized behind a per-kind queue, exactly as
 * `review-files.ts` does and for the same reason: every operation the store
 * performs is a read-modify-write of the whole file, so two overlapping calls
 * would let the second one's read miss the first one's write and clobber it.
 * The queue wraps the WHOLE store call rather than just the write half —
 * queueing only the save would still let two decisions read the same snapshot
 * and each save its own edit over the other's. That is what makes a batch
 * accept — several decisions fired back to back at one collection — safe.
 */
import { readdir } from 'fs/promises';
import { dirname } from 'path';
import { recommendationFile } from '@shared/game/recommendations';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';
import type { EntityKind } from '@shared/game/data';
import type { Recommendation, RecommendationStorage } from '@shared/game/recommendations';

const queues = new Map<EntityKind, Promise<unknown>>();

const recommendationFilePath = (kind: EntityKind): string =>
  getUserDataPath(...recommendationFile(kind).split('/'));

/**
 * The collections that actually have a file on disk, read from the directory
 * rather than from a hardcoded list — the engine names a file per kind, so the
 * directory IS the list, and one that cannot drift out of step with it.
 */
const storedRecommendationKinds = async (): Promise<readonly EntityKind[]> => {
  try {
    const names = await readdir(dirname(recommendationFilePath('screen')));
    return names.filter(name => name.endsWith('.json')).map(name => name.slice(0, -'.json'.length) as EntityKind);
  } catch {
    return [];
  }
};

const loadRecommendationFile = (kind: EntityKind): Promise<readonly Recommendation[]> =>
  readJson<readonly Recommendation[]>(recommendationFilePath(kind), []);

/** Runs `task` after everything already queued for this kind, failure included. */
const queued = <T>(kind: EntityKind, task: () => Promise<T>): Promise<T> => {
  const previous = queues.get(kind) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(task);
  queues.set(kind, next);
  return next;
};

/**
 * The port the engine's store is built on. Neither half queues: the handler
 * already holds this kind's turn for the length of the whole operation, and a
 * load or a save that tried to take that turn again would wait on itself.
 */
const recommendationStorage: RecommendationStorage = {
  load: (kind) => loadRecommendationFile(kind),
  save: (kind, entries) => writeJson(recommendationFilePath(kind), entries),
};

export {
  loadRecommendationFile, queued, recommendationFilePath, recommendationStorage, storedRecommendationKinds,
};
