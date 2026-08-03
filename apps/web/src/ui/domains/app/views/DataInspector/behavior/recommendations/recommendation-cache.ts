/* @layer renderer-app @kind logic */
/**
 * The renderer's read model of the recommendation store — a cache per
 * collection, one flattened snapshot across all of them, and a subscription so
 * every viewer re-renders together.
 *
 * The COLLECTION itself lives in the main process (see
 * electron/recommendations/): both mutating operations are read-modify-write
 * over a whole file, so they are performed there, behind one per-kind queue,
 * and what comes back is the new contents. This module never merges an edit of
 * its own — it stores what the main process returned, which is what keeps two
 * accepts fired in quick succession from disagreeing about what the file holds.
 *
 * Plain module functions rather than a hook, mirroring `review-store.ts`, so a
 * non-React caller can read the current entries synchronously.
 */
import { ENTITY_KINDS } from '../../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { DetectionContext, DraftRecommendation, Recommendation } from '@shared/game/recommendations';

const NONE: readonly Recommendation[] = [];

const cache = new Map<EntityKind, readonly Recommendation[]>();
const loading = new Set<EntityKind>();
const listeners = new Set<() => void>();

/**
 * Rebuilt only when something actually changed, never per read: this is what
 * `useSyncExternalStore` compares, and a fresh array every call would re-render
 * forever.
 */
let flattened: readonly Recommendation[] = NONE;

const rebuild = (): void => {
  flattened = ENTITY_KINDS.flatMap(kind => cache.get(kind) ?? NONE);
};

const notify = (): void => {
  rebuild();
  for (const listener of listeners) listener();
};

const store = (kind: EntityKind, entries: readonly Recommendation[] | null | undefined): void => {
  cache.set(kind, entries ?? NONE);
  notify();
};

/** Subscribes to any change across every collection — the hook's store glue. */
const subscribeRecommendations = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Re-reads one collection from disk, whatever the cache already held. */
const refreshRecommendations = async (kind: EntityKind): Promise<void> => {
  loading.add(kind);
  try {
    store(kind, await window.api.loadRecommendations(kind));
  } catch {
    store(kind, NONE);
  } finally {
    loading.delete(kind);
  }
};

/** Kicks off (once per kind) the background load for every collection. */
const ensureRecommendationsLoaded = (): void => {
  for (const kind of ENTITY_KINDS) {
    if (cache.has(kind) || loading.has(kind)) continue;
    void refreshRecommendations(kind);
  }
};

/** Every stored recommendation, in collection order. Stable between changes. */
const allRecommendations = (): readonly Recommendation[] => {
  ensureRecommendationsLoaded();
  return flattened;
};

/**
 * Records a verdict and adopts the collection the main process wrote back.
 * `accepted` is stamped only AFTER the dataset write it describes has landed —
 * see `accept-recommendation.ts`, which is the only caller that passes it.
 */
const decideRecommendation = async (
  kind: EntityKind,
  id: string,
  state: 'accepted' | 'dismissed',
): Promise<void> => {
  store(kind, await window.api.decideRecommendation(kind, id, state));
};

/**
 * Folds one detection pass into the main-process store and adopts what it
 * returns, mirroring `decideRecommendation` — this is the write side a live
 * context builder calls after `runDetection`, so every viewer (the widget's
 * own list and the Data Inspector's comparison view) reads the same result
 * from the one store rather than two caches disagreeing about it.
 */
const applyRecommendationPass = async (
  kind: EntityKind,
  context: DetectionContext,
  detectorIds: readonly string[],
  drafts: readonly DraftRecommendation[],
): Promise<void> => {
  const result = await window.api.applyRecommendationPass(kind, context, detectorIds, drafts);
  store(kind, result.entries);
};

/** Drops every cached collection — for a test, or a profile switch. */
const clearRecommendationCache = (): void => {
  cache.clear();
  loading.clear();
  notify();
};

export {
  allRecommendations, applyRecommendationPass, clearRecommendationCache, decideRecommendation,
  ensureRecommendationsLoaded, refreshRecommendations, subscribeRecommendations,
};
