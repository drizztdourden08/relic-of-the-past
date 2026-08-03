/* @layer renderer-app @kind logic */
/**
 * React binding over `review-store.ts`'s cache: subscribes a component to one
 * collection's review data so a note/status edit re-renders every viewer of
 * that kind, not just the one that made the edit. The plain functions
 * underneath stay directly importable for non-React callers (the
 * collection-sources join reads `reviewFor` synchronously without this hook).
 */
import { useCallback, useSyncExternalStore } from 'react';
import { reviewFileFor, reviewFor, setReviewNote, setReviewStatus, subscribeReview } from './review-store';
import type { EntityKind } from '@shared/game/data';
import type { ReviewEntry } from '@shared/game/review/types';

interface UseReviewStoreResult {
  reviewFor: (id: string) => ReviewEntry;
  setReviewStatus: (id: string, status: ReviewEntry['status']) => void;
  setReviewNote: (id: string, note: string) => void;
}

const useReviewStore = (kind: EntityKind): UseReviewStoreResult => {
  // Client-only cache — there is no separate server snapshot, so the same
  // getter serves both. Without a third argument React's server renderer
  // throws rather than falling back (see react-dom/server's useSyncExternalStore),
  // and this dev-only view is still rendered through that path in tests.
  const getSnapshot = useCallback(() => reviewFileFor(kind), [kind]);
  useSyncExternalStore(
    useCallback((listener: () => void) => subscribeReview(kind, listener), [kind]),
    getSnapshot,
    getSnapshot,
  );

  return {
    reviewFor: useCallback((id: string) => reviewFor(kind, id), [kind]),
    setReviewStatus: useCallback((id: string, status: ReviewEntry['status']) => setReviewStatus(kind, id, status), [kind]),
    setReviewNote: useCallback((id: string, note: string) => setReviewNote(kind, id, note), [kind]),
  };
};

export { useReviewStore };
export type { UseReviewStoreResult };
