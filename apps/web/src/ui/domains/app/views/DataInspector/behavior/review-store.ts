/* @layer renderer-app @kind logic */
/**
 * Cache and IPC round trip for the personal review layer: one JSON file per
 * collection (`Data/review/<kind>.json`), keyed by record id, separate from
 * the committed dataset. Plain module functions so a non-React caller can read
 * synchronously; `reviewFor` answers from cache (the untouched default before
 * load) and `ensureLoaded` starts the background read. `use-review-store.ts`
 * adds subscription for components.
 */
import type { EntityKind } from '@shared/game/data';
import type { ReviewEntry, ReviewFile } from '@shared/game/review/types';

const SAVE_DEBOUNCE_MS = 300;

const EMPTY_FILE: ReviewFile = {};

const DEFAULT_ENTRY: ReviewEntry = { status: 'untouched', note: '', reviewedAt: null, updatedAt: null };

const cache = new Map<EntityKind, ReviewFile>();
const loading = new Set<EntityKind>();
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Map<EntityKind, Set<() => void>>();

const timerKey = (kind: EntityKind, id: string): string => `${kind}:${id}`;

const notify = (kind: EntityKind): void => {
  for (const listener of listeners.get(kind) ?? []) listener();
};

/** Subscribes to cache changes for one kind. */
const subscribeReview = (kind: EntityKind, listener: () => void): (() => void) => {
  const set = listeners.get(kind) ?? new Set<() => void>();
  set.add(listener);
  listeners.set(kind, set);
  return () => { set.delete(listener); };
};

/** Kicks off (once) the background load for a kind. Safe to call repeatedly. */
const ensureLoaded = (kind: EntityKind): void => {
  if (cache.has(kind) || loading.has(kind)) return;
  loading.add(kind);
  void window.api.loadReview(kind)
    .then((file) => {
      cache.set(kind, (file ?? EMPTY_FILE) as ReviewFile);
    })
    .catch(() => {
      cache.set(kind, EMPTY_FILE);
    })
    .finally(() => {
      loading.delete(kind);
      notify(kind);
    });
};

/** The whole loaded file for a kind, or the shared empty file before the load resolves. */
const reviewFileFor = (kind: EntityKind): ReviewFile => {
  ensureLoaded(kind);
  return cache.get(kind) ?? EMPTY_FILE;
};

/** One record's review entry, defaulting to the untouched baseline. */
const reviewFor = (kind: EntityKind, id: string): ReviewEntry =>
  reviewFileFor(kind)[id] ?? DEFAULT_ENTRY;

const scheduleSave = (kind: EntityKind, id: string, entry: ReviewEntry): void => {
  const key = timerKey(kind, id);
  const existing = saveTimers.get(key);
  if (existing) clearTimeout(existing);
  saveTimers.set(key, setTimeout(() => {
    saveTimers.delete(key);
    void window.api.saveReview(kind, id, entry);
  }, SAVE_DEBOUNCE_MS));
};

const writeEntry = (kind: EntityKind, id: string, entry: ReviewEntry): void => {
  cache.set(kind, { ...reviewFileFor(kind), [id]: entry });
  notify(kind);
  scheduleSave(kind, id, entry);
};

/** Sets a record's status and stamps `reviewedAt`. */
const setReviewStatus = (kind: EntityKind, id: string, status: ReviewEntry['status']): void => {
  writeEntry(kind, id, { ...reviewFor(kind, id), status, reviewedAt: Date.now() });
};

/** Sets a record's note and stamps `reviewedAt`. */
const setReviewNote = (kind: EntityKind, id: string, note: string): void => {
  writeEntry(kind, id, { ...reviewFor(kind, id), note, reviewedAt: Date.now() });
};

/** Stamps `updatedAt` only. Called after a real dataset save (`accept-recommendation.ts`), never by the editors above. */
const markWritten = (kind: EntityKind, id: string): void => {
  writeEntry(kind, id, { ...reviewFor(kind, id), updatedAt: Date.now() });
};

export {
  DEFAULT_ENTRY, markWritten, reviewFileFor, reviewFor, setReviewNote, setReviewStatus, subscribeReview,
};
