/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';

const openRecommendations = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.state === 'open');

export { openRecommendations };
