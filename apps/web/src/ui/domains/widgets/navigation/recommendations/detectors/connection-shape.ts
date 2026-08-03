/* @layer renderer-widgets @kind logic */
/**
 * A connection the dataset HAS, but which is missing part of its description.
 *
 * `connectionIssues` already found these; all it could do was print them. Two of
 * its four checks have a computable fix, and those are the two that become
 * recommendations:
 *
 *  • no `dir:*` tag — the record's own `direction` field says which it is, so
 *    the tag is derived, not guessed. Enumerable from the record: `certain`.
 *  • no tile data — the live flood crossing says where it crosses, and
 *    `buildConnectionNav` turns that into the same `nav` the writer would store.
 *    Flood evidence proves presence only: `likely`.
 *
 * The tile fix is deliberately NOT gated on the warning. `connectionIssues`
 * asks "is there anything to show?", and it answers yes the moment the display
 * falls back to the live flood — which is the exact moment a fix becomes
 * computable. Gating on it would mean proposing a nav only when no nav could be
 * derived. The record-level question is the one worth asking: the record has no
 * persisted `nav`, and a live crossing can supply one.
 *
 * The other two produce no recommendation, deliberately:
 *
 *  • unknown endpoint screen — there is no safe value to propose. Inventing an
 *    endpoint id is the one thing the whole connection path refuses to do.
 *  • no `transit:*` tag — OBSOLETE. The migration promoted the transit terms
 *    (door, stairs, hole, warp, mirror, walk, swim) into `ConnectionRecord.kind`
 *    and retired them from the tag list, so of 896 connection records not one
 *    carries a retired transit tag and the check now fires on nearly all of
 *    them. The fact it reports is already in `kind`. Reviving it as a
 *    recommendation would bury every real finding under ~840 false ones, so the
 *    warning stays a warning until the check itself is retired.
 */
import { connectionTagKeysOf, tagIdsForKeys } from '@shared/game/data';
import type { ConnectionRecord } from '@shared/game/data';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import type {
  DetectionContext, DraftRecommendation, RecommendationDetector,
} from '@shared/game/recommendations';
import { CONNECTION_ISSUE, connectionIssues, unknownScreen } from '../../connection-issues';
import { describeConnectionTiles, findFloodForTarget } from '../../connection-tile-display';

const DETECTOR_ID = 'connection-shape';

type Draft = DraftRecommendation<'connection'>;

const draftFor = (
  current: ConnectionRecord,
  proposed: ConnectionRecord,
  key: string,
  reason: string,
  evidence: { source: string; detail: string },
  confidence: 'certain' | 'likely',
  context: DetectionContext,
): Draft => ({
  kind: 'connection',
  action: 'update',
  targetId: current.id,
  current,
  proposed,
  reason,
  detector: DETECTOR_ID,
  evidence: [evidence],
  confidence,
  screenId: context.screenId,
  origin: context.origin,
  key,
});

/** The `dir:` tag the record's own `direction` field already implies. */
const directionFix = (current: ConnectionRecord, context: DetectionContext): Draft => draftFor(
  current,
  { ...current, tags: [...current.tags, ...tagIdsForKeys([`dir:${current.direction}`])] },
  'tags.dir',
  `The record has no dir: tag, but its direction field says ${current.direction}.`,
  { source: 'dataset:connection.direction', detail: `direction is '${current.direction}'` },
  'certain',
  context,
);

/** Where the crossing physically sits, derived from the live flood crossing. */
const tileFix = (current: ConnectionRecord, context: DetectionContext): Draft | null => {
  // Already persisted — the record is complete, whatever the display is doing.
  if (current.nav) return null;
  const info = findFloodForTarget([...context.observations.floodConnections], current.toScreenId);
  // No live crossing backs it, so there is nothing to attach. Absence of flood
  // coverage is not evidence of anything — stay silent rather than propose.
  if (!info) return null;

  const nav = buildConnectionNav(info, connectionTagKeysOf(current.tags));
  return draftFor(
    current,
    { ...current, nav },
    'nav',
    'The record carries no tile data; the live flood crossing supplies where it connects.',
    { source: 'flood:crossing', detail: `crossing on the ${info.edge} border, ${info.positions.length} tile(s)` },
    'likely',
    context,
  );
};

const draftsFor = (current: ConnectionRecord, context: DetectionContext): Draft[] => {
  const { screenId, observations } = context;
  const tags = connectionTagKeysOf(current.tags);
  const view = { from: current.fromScreenId, to: current.toScreenId, tags, nav: current.nav };
  const tileDesc = describeConnectionTiles(view, [...observations.floodConnections], screenId);
  const issues = connectionIssues({ from: view.from, to: view.to, tags }, tileDesc);

  // An endpoint that resolves to nothing is the one case with no safe proposal
  // at all — not the direction, not the nav — so the record is left alone.
  if (issues.some(issue => issue === unknownScreen(view.from) || issue === unknownScreen(view.to))) return [];

  const drafts: Draft[] = [];
  if (issues.includes(CONNECTION_ISSUE.noDirection)) drafts.push(directionFix(current, context));
  const fix = tileFix(current, context);
  if (fix) drafts.push(fix);
  return drafts;
};

const connectionShapeDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['connection'],
  detect: (context: DetectionContext) =>
    context.observations.existingConnections.flatMap(current => draftsFor(current, context)),
};

export { connectionShapeDetector };
