/* @layer renderer-app @kind hook */
import { useCallback, useSyncExternalStore } from 'react';
import type { Recommendation } from '@shared/game/recommendations';
import { allRecommendations, subscribeRecommendations } from '../recommendation-cache';

const subscribe = (listener: () => void): (() => void) => subscribeRecommendations(listener);

const useRecommendations = (): readonly Recommendation[] => {
  const getSnapshot = useCallback(() => allRecommendations(), []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export { useRecommendations };
