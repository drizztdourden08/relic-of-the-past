/* @layer package @kind barrel */
import '../../recommendations/strategies/actor';
import '../../recommendations/strategies/check';
import '../../recommendations/strategies/dungeon';
import '../../recommendations/strategies/item';
import '../../recommendations/strategies/screen';
import '../../recommendations/strategy-detectors';
export { detectorFromStrategy, eraseSetProbe, known, registerStrategy, unread } from '../../recommendations/compare';
export type { ComparisonStrategy, ErasedSetProbe, FieldProbe, Probe, SetProbe, UnresolvableMapper } from '../../recommendations/compare';
export { changedPaths, createRecommendationStore, detectorsFor, diffsByRecordFrom, linesForPaths, memoryStorage, recommendationFile, recommendationId, reconcile, registerDetector, runDetection, runDetectionSweep, scopedToPass } from '../../recommendations';
export type { Confidence, DetectionContext, Difference, DraftRecommendation, Recommendation, RecommendationAction, RecommendationStorage, ScreenObservations } from '../../recommendations';
export type { PassResult } from '../../recommendations/store';
export { actorStrategy } from '../../recommendations/strategies/actor';
export { checkStrategy } from '../../recommendations/strategies/check';
export { dungeonStrategy } from '../../recommendations/strategies/dungeon';
export { itemStrategy } from '../../recommendations/strategies/item';
export { screenStrategy } from '../../recommendations/strategies/screen';
export { buildScreenDraftRecord } from '../../recommendations/strategies/screen/screen-draft';
