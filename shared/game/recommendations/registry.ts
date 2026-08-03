/* @layer shared-game @kind logic */
/**
 * Registry of detectors — the same Strategy registry the field kits use, for the
 * same reason: adding a ninth way of noticing the dataset is wrong should be one
 * registration, not an edit in every consumer.
 *
 * Registration is a side effect of importing `detectors/index.ts`, so a caller
 * that went through the barrel always has the built-ins. Nothing here reads the
 * game or the dataset; a detector is handed its observations.
 */
import type { EntityKind } from '../data/types';
import type { DetectionContext, RecommendationDetector } from './detection-types';
import { recommendationId } from './id';
import type { DraftRecommendation } from './types';

const detectors = new Map<string, RecommendationDetector>();

/** Re-registering the same id replaces it, so a host can override a built-in. */
const registerDetector = (detector: RecommendationDetector): void => {
  detectors.set(detector.id, detector);
};

const allDetectors = (): readonly RecommendationDetector[] => [...detectors.values()];

const detectorsFor = (kind: EntityKind): readonly RecommendationDetector[] =>
  allDetectors().filter(detector => detector.kinds.includes(kind));

/** For tests that need a clean registry rather than whatever a barrel installed. */
const clearDetectors = (): void => { detectors.clear(); };

interface DetectionRun {
  /**
   * Every detector that RAN, including those that found nothing. The store needs
   * this to scope reconciliation: a detector that ran and stayed silent is how a
   * finding stops reproducing.
   */
  detectorIds: readonly string[];
  drafts: readonly DraftRecommendation[];
}

/**
 * Runs every detector registered for `kind` and returns their drafts, deduped by
 * the id they would mint. Two detectors that independently notice the same thing
 * about the same record are agreeing, not disagreeing — and the ids say so.
 */
const runDetection = (kind: EntityKind, context: DetectionContext): DetectionRun => {
  const chosen = detectorsFor(kind);
  const byId = new Map<string, DraftRecommendation>();

  for (const detector of chosen) {
    for (const draft of detector.detect(context)) {
      const id = recommendationId(draft);
      if (!byId.has(id)) byId.set(id, draft);
    }
  }

  return { detectorIds: chosen.map(detector => detector.id), drafts: [...byId.values()] };
};

export { allDetectors, clearDetectors, detectorsFor, registerDetector, runDetection };
export type { DetectionRun };
