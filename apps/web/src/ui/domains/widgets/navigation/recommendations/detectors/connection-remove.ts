/* @layer renderer-widgets @kind logic */
/**
 * A dataset edge leaving this screen that NO real in-game transition backs.
 *
 * Wraps `buildBadFindings`, and the asymmetry that function is built around is
 * the whole reason this detector can exist at all: the native room tables
 * (stairs, exits, entrances, holes) are fully enumerable for the loaded room, so
 * an absence in them is provable, while the flood only ever proves presence. A
 * `kind: 'edge'` connection is backed by flood evidence, so `buildBadFindings`
 * refuses to propose removing one — a border the flood did not reach is not
 * proof there is no crossing there. Nothing here relaxes that.
 *
 * Everything that survives that filter is therefore `certain`, which is what
 * makes a batch accept of these safe.
 */
import type { ConnectionRecord } from '@shared/game/data';
import type {
  DetectionContext, DraftRecommendation, RecommendationDetector,
} from '@shared/game/recommendations';
import { buildBadFindings } from '../../connection-audit-core';
import type { ConnectionSuggestion } from '../../connection-audit-types';

const DETECTOR_ID = 'connection-remove';

const toDraft = (finding: ConnectionSuggestion, context: DetectionContext): DraftRecommendation<'connection'> => {
  // The audit reports on an EXISTING record, so `record` is always the real one.
  const current = finding.record as ConnectionRecord;
  return {
    kind: 'connection',
    action: 'delete',
    targetId: current.id,
    current,
    // Nothing replaces a deletion. The record is carried through so a reviewer
    // sees exactly what would go, and so `changedPaths` reports an empty diff —
    // for a delete the action is the change, not any field.
    proposed: current,
    reason: finding.reason,
    detector: DETECTOR_ID,
    evidence: [{
      source: 'native:room-transitions',
      detail: `no enumerated transition from ${finding.fromScreenId} reaches ${finding.toScreenId}`,
    }],
    confidence: 'certain',
    screenId: finding.fromScreenId,
    origin: context.origin,
  };
};

const connectionRemoveDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['connection'],
  detect: (context: DetectionContext) => {
    const { screenId, observations } = context;
    // Without the room's tables there is nothing to be certain about, and an
    // unread table must never be read as an empty one.
    if (!screenId || !observations.realAvailable) return [];
    return buildBadFindings(screenId, observations.realTransitions).map(finding => toDraft(finding, context));
  },
};

export { connectionRemoveDetector };
