/* @layer shared-game @kind barrel */
export {
  diffsByRecordFrom,
} from './compare';
export type {
  Difference,
} from './compare';
export { changedPaths, linesForPaths } from './diff';
export { recommendationId } from './id';
export { reconcile, scopedToPass } from './reconcile';
export {
  detectorsFor,
  registerDetector,
  runDetection,
  runDetectionSweep,
} from './registry';
export { createRecommendationStore, memoryStorage, recommendationFile } from './store';
export type { RecommendationStorage } from './store';
export type { DetectionContext, ScreenObservations } from './detection-types/detection.type';
export type {
  Confidence,
  DraftRecommendation,
  Recommendation,
  RecommendationAction,
} from './types';
