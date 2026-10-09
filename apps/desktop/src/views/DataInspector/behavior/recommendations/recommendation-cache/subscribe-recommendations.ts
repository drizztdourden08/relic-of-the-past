/* @layer renderer-app @kind logic */
import { recommendationStore } from './recommendation-store';

const subscribeRecommendations = (listener: () => void): (() => void) => {
  recommendationStore.listeners.add(listener);
  return () => { recommendationStore.listeners.delete(listener); };
};

export { subscribeRecommendations };
