/* @layer renderer-app @kind logic */
/**
 * React binding over `recommendation-cache.ts`: subscribes a component to every
 * collection's findings at once, so a verdict recorded in the detail panel
 * re-renders the list beside it. The plain functions underneath stay directly
 * importable for callers that are not components.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { allRecommendations, subscribeRecommendations } from './recommendation-cache';
import { byConfidenceThenAge, openRecommendations } from './recommendation-rows';
import type { Recommendation } from '@shared/game/recommendations';

const subscribe = (listener: () => void): (() => void) => subscribeRecommendations(listener);

/**
 * Every stored finding, in no particular order — the raw read. Client-only
 * cache, so the same getter serves the server snapshot too (see the note in
 * `use-review-store.ts` for why the third argument is not optional here).
 */
const useRecommendations = (): readonly Recommendation[] => {
  const getSnapshot = useCallback(() => allRecommendations(), []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

/**
 * The findings a review pass works through, in the order it should work through
 * them — certain first, oldest first within each. Shared by the table (through
 * the row builder) and by "next open finding" after a decision, so the two can
 * never disagree about what comes next.
 */
const openInPassOrder = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge);

export { openInPassOrder, useRecommendations };
