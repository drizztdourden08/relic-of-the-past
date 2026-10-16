/* @layer renderer-app @kind hook */
import { useCallback, useSyncExternalStore } from 'react';
import { recommendationsReady, subscribeRecommendations } from '../recommendation-cache';

const subscribe = (listener: () => void): (() => void) => subscribeRecommendations(listener);

const never = (): (() => void) => () => undefined;

const useRecommendationsReady = (enabled: boolean): boolean => {
  const getSnapshot = useCallback(() => !enabled || recommendationsReady(), [enabled]);
  return useSyncExternalStore(enabled ? subscribe : never, getSnapshot, getSnapshot);
};

export { useRecommendationsReady };
