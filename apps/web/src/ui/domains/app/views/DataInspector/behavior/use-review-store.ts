/* @layer renderer-app @kind logic */
/** React binding over `review-store.ts`: subscribes a component to one collection's review data. */
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
  // Client-only cache, so the same getter serves the server snapshot. Without a
  // third argument react-dom/server's useSyncExternalStore throws, and tests
  // render this view through that path.
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
