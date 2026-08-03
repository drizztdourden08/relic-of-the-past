/* @layer renderer-widgets @kind logic */
/**
 * A crossing the game exposes from this screen that no dataset edge maps.
 *
 * The finding is `buildAddFindings`' — this wraps it rather than repeating it,
 * so the widget's audit list and the recommendation store can never come to
 * different conclusions about what is missing. What the wrapper adds is the
 * record as a RECORD (the audit already built one; it was only ever rendered to
 * text on the way out) and the confidence the batch-accept gate reads.
 */
import type { PendingConnectionRecord } from '@shared/game/data/record-codegen';
import type {
  DetectionContext, DraftRecommendation, ObservedCrossing, RecommendationDetector,
} from '@shared/game/recommendations';
import { buildAddFindings } from '../../connection-audit-core';
import type { ConnectionSuggestion } from '../../connection-audit-types';

const DETECTOR_ID = 'connection-add';

/**
 * A crossing read off a native table (an entrance, a stair, a fall hole, the
 * exit map) is enumerable, so the dataset's silence about it is a proven gap.
 * A scroll `edge` comes from the flood, which only ever proves presence — it
 * cannot be graded `certain` without making the batch-accept unsafe.
 */
const confidenceFor = (crossing: ObservedCrossing | undefined) =>
  crossing && crossing.type !== 'edge' ? 'certain' as const : 'likely' as const;

const evidenceFor = (crossing: ObservedCrossing | undefined) => [{
  source: crossing && crossing.type !== 'edge' ? `native:${crossing.type}` : 'flood:crossing',
  detail: crossing
    ? `game exposes a ${crossing.type} to raw index 0x${crossing.targetRoomOrScreen.toString(16).toUpperCase()}`
    : 'crossing observed leaving this screen',
}];

const toDraft = (
  finding: ConnectionSuggestion,
  crossings: readonly ObservedCrossing[],
  context: DetectionContext,
): DraftRecommendation<'connection'> => {
  const crossing = crossings.find(c => c.toScreenId === finding.toScreenId);
  return {
    kind: 'connection',
    action: 'create',
    // No id yet — the main-process allocator mints it, and nothing here may
    // invent one. The proposal is the id-less record the insert channel takes.
    targetId: null,
    current: null,
    proposed: finding.record as PendingConnectionRecord,
    reason: finding.reason,
    detector: DETECTOR_ID,
    evidence: evidenceFor(crossing),
    confidence: confidenceFor(crossing),
    screenId: finding.fromScreenId,
    origin: context.origin,
    // A screen can be missing several crossings at once, and a `create` has no
    // target id to tell them apart — the destination is what does.
    key: `to:${finding.toScreenId}`,
  };
};

const connectionAddDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['connection'],
  detect: (context: DetectionContext) => {
    const { screenId, observations } = context;
    // `realAvailable` false means the room's tables were never read. Reading
    // that as "the game exposes nothing" would be the same mistake the audit
    // refuses to make on the remove side.
    if (!screenId || !observations.realAvailable) return [];

    const findings = buildAddFindings(screenId, observations.unmatchedCrossings, observations.floodConnections);
    return findings.map(finding => toDraft(finding, observations.unmatchedCrossings, context));
  },
};

export { connectionAddDetector };
