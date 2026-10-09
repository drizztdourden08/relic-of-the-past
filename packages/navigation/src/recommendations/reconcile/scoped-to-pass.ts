/* @layer shared-game @kind logic */
import type { Recommendation } from '../types';

const scopedToPass = (
  detectorIds: readonly string[],
  screenId: string | null,
): ((recommendation: Recommendation) => boolean) => {
  const owners = new Set(detectorIds);
  return (recommendation) => owners.has(recommendation.detector) && recommendation.screenId === screenId;
};

export { scopedToPass };
