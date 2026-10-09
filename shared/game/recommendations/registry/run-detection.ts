/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '../detection-types';
import { recommendationId } from '../id';
import type { DraftRecommendation } from '../types';
import { detectorsFor } from './detectors-for';
import type { DetectionRun } from './registry.type';

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

export { runDetection };
