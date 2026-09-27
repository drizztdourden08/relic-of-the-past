/* @layer electron-main @kind logic */
/**
 * Disk adapter behind `RecommendationStorage`: one file per collection at
 * `Data/recommendations/<kind>.json` under `getUserDataPath`. The relative path
 * comes from `recommendationFile` so the engine stays the single source of truth.
 *
 * Same-kind operations are serialized behind a per-kind queue, as in
 * `review-files.ts`: every operation is a read-modify-write of the whole file.
 * The queue wraps the WHOLE store call, not just the save, or two decisions
 * could read the same snapshot and clobber each other. That is what makes a
 * batch accept safe.
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
 * instead of a hardcoded list. The engine names a file per kind, so the
 * directory IS the list, and it cannot drift out of step.
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
