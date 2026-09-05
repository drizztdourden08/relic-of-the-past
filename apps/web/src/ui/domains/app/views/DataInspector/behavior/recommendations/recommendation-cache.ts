/* @layer renderer-app @kind logic */
/**
 * The renderer's read model of the recommendation store. The collection itself
 * lives in the main process (electron/recommendations/) behind a per-kind
 * queue; this module never merges an edit of its own, it stores what the main
 * process returned, so two quick accepts cannot disagree about the file.
 * Plain module functions, like `review-store.ts`, so non-React callers can
 * read synchronously.
 */
import { ENTITY_KINDS } from '../../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { DetectionContext, DraftRecommendation, Recommendation } from '@shared/game/recommendations';

const NONE: readonly Recommendation[] = [];

const cache = new Map<EntityKind, readonly Recommendation[]>();
const loading = new Set<EntityKind>();
const listeners = new Set<() => void>();

/** Rebuilt only on change: `useSyncExternalStore` compares this, and a fresh array per read would re-render forever. */
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

/** Subscribes to any change across every collection. */
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

/** Records a verdict and adopts what the main process wrote back. `accepted` is
 *  stamped only after the dataset write has landed (see `accept-recommendation.ts`). */
const decideRecommendation = async (
  kind: EntityKind,
  id: string,
  state: 'accepted' | 'dismissed',
): Promise<void> => {
  store(kind, await window.api.decideRecommendation(kind, id, state));
};

/** Folds one detection pass into the main-process store and adopts what it
 *  returns, so every viewer reads the same result from the one store. */
const applyRecommendationPass = async (
  kind: EntityKind,
  context: DetectionContext,
  detectorIds: readonly string[],
  drafts: readonly DraftRecommendation[],
): Promise<void> => {
  const result = await window.api.applyRecommendationPass(kind, context, detectorIds, drafts);
  store(kind, result.entries);
};

/** Drops every cached collection, for a test or a profile switch. */
const clearRecommendationCache = (): void => {
  cache.clear();
  loading.clear();
  notify();
};

export {
  allRecommendations, applyRecommendationPass, clearRecommendationCache, decideRecommendation,
  ensureRecommendationsLoaded, refreshRecommendations, subscribeRecommendations,
};
