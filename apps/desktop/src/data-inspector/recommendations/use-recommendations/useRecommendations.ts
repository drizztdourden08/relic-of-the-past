/* @layer renderer-app @kind hook */
import { useCallback, useSyncExternalStore } from 'react';
import type { Recommendation } from '@rotp/navigation';
import { allRecommendations, subscribeRecommendations } from '../recommendation-cache';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';

const subscribe = (listener: () => void): (() => void) => subscribeRecommendations(listener);

const never = (): (() => void) => () => undefined;

const useRecommendations = (enabled = true): readonly Recommendation[] => {
  const getSnapshot = useCallback(() => (enabled ? allRecommendations() : NO_RECOMMENDATIONS), [enabled]);
  return useSyncExternalStore(enabled ? subscribe : never, getSnapshot, getSnapshot);
};

export { useRecommendations };
