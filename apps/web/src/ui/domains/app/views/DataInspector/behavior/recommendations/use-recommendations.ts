/* @layer renderer-app @kind logic */
/** React binding over `recommendation-cache.ts`: subscribes to every collection's findings at once. */
import { useCallback, useSyncExternalStore } from 'react';
import { allRecommendations, subscribeRecommendations } from './recommendation-cache';
import { byConfidenceThenAge, openRecommendations } from './recommendation-rows';
import type { Recommendation } from '@shared/game/recommendations';

const subscribe = (listener: () => void): (() => void) => subscribeRecommendations(listener);

/** Every stored finding, unordered. Client-only cache, so the same getter serves
 *  the server snapshot (see `use-review-store.ts` on the third argument). */
const useRecommendations = (): readonly Recommendation[] => {
  const getSnapshot = useCallback(() => allRecommendations(), []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

/** Open findings in pass order. Shared by the table and by "next open finding", so they never disagree. */
const openInPassOrder = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge);

export { openInPassOrder, useRecommendations };
