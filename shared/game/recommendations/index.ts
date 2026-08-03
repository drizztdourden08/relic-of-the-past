/* @layer shared-game @kind barrel */
export { changedPaths, linesForPaths } from './diff';
export { fnv1a, identityOf, recommendationId } from './id';
export { pathLines } from './path-lines';
export { reconcile, scopedToPass } from './reconcile';
export { allDetectors, clearDetectors, detectorsFor, registerDetector, runDetection } from './registry';
export { createRecommendationStore, memoryStorage, recommendationFile } from './store';
export type { DetectionRun } from './registry';
export type { ReconcileOptions } from './reconcile';
export type { PassResult, RecommendationStorage, RecommendationStore } from './store';
export type {
  ChestObservation, DetectionContext, GrantedItemObservation, LiveSpriteObservation, ObservedCrossing,
  ObservedDestKind, ObservedTransition, RecommendationDetector, ScreenObservations, SpriteCombatObservation,
} from './detection-types';
export type {
  Confidence, DraftRecommendation, EntityIdOf, Evidence, ProposedRecord,
  Recommendation, RecommendationAction, RecommendationOrigin, RecommendationState,
} from './types';
