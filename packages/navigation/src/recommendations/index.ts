/* @layer shared-game @kind barrel */
export {
  allStrategies, classify, clearStrategies, compareField, compareSet, compareSets, deepEqual,
  defaultFormat, detectorFromStrategy, diffsByRecordFrom, getPath, hex2, hex4, isAbsent, known, registerStrategy,
  runComparison, setPath, strategyFor, unread,
} from './compare';
export type {
  ComparisonStrategy, Difference, DifferenceStatus, FieldProbe, Probe, SetDifference,
  SetDifferenceStatus, SetProbe, SubjectComparison, UnresolvableMapper,
} from './compare';
export { changedPaths, linesForPaths } from './diff';
export { fnv1a, identityOf, recommendationId } from './id';
export { pathLines } from './path-lines';
export { reconcile, scopedToPass } from './reconcile';
export {
  allDetectors, clearDetectors, detectorsFor, registerDetector, runDetection, runDetectionSweep,
} from './registry';
export { createRecommendationStore, memoryStorage, recommendationFile } from './store';
export type { DetectionRun, DetectionSweep } from './registry';
export type { ReconcileOptions } from './reconcile';
export type { PassResult, RecommendationStorage, RecommendationStore } from './store';
export type { ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation, LiveWalkBoundary, ObservedCrossing, ObservedDestKind, ObservedTransition, SpriteCombatObservation } from '@rotp/game-core';
export type { DetectionContext, RecommendationDetector, ScreenObservations } from './detection-types/detection.type';
export type {
  Confidence, DraftRecommendation, EntityIdOf, Evidence, ProposedRecord,
  Recommendation, RecommendationAction, RecommendationOrigin, RecommendationState,
} from './types';
