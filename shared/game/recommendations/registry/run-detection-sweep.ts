/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '../detection-types';
import { recommendationId } from '../id';
import type { DraftRecommendation } from '../types';
import type { DetectionSweep } from './registry.type';
import { runDetection } from './run-detection';

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

export { runDetectionSweep };
