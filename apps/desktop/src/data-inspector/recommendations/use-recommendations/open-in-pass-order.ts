/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import { byConfidenceThenAge, openRecommendations } from '../recommendation-rows';

const openInPassOrder = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge);

export { openInPassOrder };
