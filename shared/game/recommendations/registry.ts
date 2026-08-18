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

interface DetectionSweep {
  /** Every detector that ran across every kind — see `DetectionRun.detectorIds`. */
  detectorIds: readonly string[];
  /** Drafts grouped by each draft's OWN kind, one entry per collection touched. */
  draftsByKind: ReadonlyMap<EntityKind, readonly DraftRecommendation[]>;
}

/**
 * One sweep over several kinds, grouped by the kind each DRAFT names rather
 * than by the kind whose detectors produced it.
 *
 * A detector is free to emit a draft about another collection (see
 * `UnresolvableMapper`), and that draft is stored, reconciled and DECIDED under
 * the collection it names — grouping by the producing kind files it where no
 * verdict ever looks, so accepting it can never close it.
 *
 * `detectorIds` is the union across the whole sweep because any detector could
 * have contributed to any group: the reconcile scope for a group has to cover
 * everything that ran, or a cross-kind finding that stops reproducing stays
 * open forever. That is sound only because the grouping is COMPLETE — every
 * draft the sweep produced lands in its own kind's group, so a group's absence
 * of a finding really is the whole sweep's silence about it.
 *
 * EVERY kind named in `kinds` gets a group, empty or not, and so does any other
 * kind a draft names. A collection with no detectors of its own can still be
 * holding a cross-kind finding from a previous pass, and only an (empty) group
 * lets that finding resolve once it stops reproducing. The extra groups are
 * near-free: an empty group reconciles to the same list the file already holds,
 * which `applyPass` recognises and does not write.
 */
const runDetectionSweep = (kinds: readonly EntityKind[], context: DetectionContext): DetectionSweep => {
  const detectorIds = new Set<string>();
  const byId = new Map<string, DraftRecommendation>();
  const draftsByKind = new Map<EntityKind, DraftRecommendation[]>();

  for (const kind of kinds) {
    draftsByKind.set(kind, []);
    const run = runDetection(kind, context);
    for (const id of run.detectorIds) detectorIds.add(id);
    for (const draft of run.drafts) {
      const id = recommendationId(draft);
      if (!byId.has(id)) byId.set(id, draft);
    }
  }

  for (const draft of byId.values()) {
    const group = draftsByKind.get(draft.kind);
    if (group) group.push(draft);
    else draftsByKind.set(draft.kind, [draft]);
  }

  return { detectorIds: [...detectorIds], draftsByKind };
};

export { allDetectors, clearDetectors, detectorsFor, registerDetector, runDetection, runDetectionSweep };
export type { DetectionRun, DetectionSweep };
