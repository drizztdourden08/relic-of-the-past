/* @layer shared-game @kind types */
import type { EntityKind } from '@rotp/game-data';
import type { DraftRecommendation } from '../types';

interface DetectionRun {
  detectorIds: readonly string[];
  drafts: readonly DraftRecommendation[];
}

interface DetectionSweep {
  detectorIds: readonly string[];
  draftsByKind: ReadonlyMap<EntityKind, readonly DraftRecommendation[]>;
}

export type { DetectionRun, DetectionSweep };
