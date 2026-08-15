/* @layer renderer-widgets @kind data */
/**
 * Every non-edge crossing leaving the current screen, as ONE `SetProbe`: the
 * missing/unresolvable/unbacked split falls out of `compareSet`'s own join.
 *
 * The live set is `observations.realTransitions` rather than
 * `unmatchedCrossings`, which arrives pre-filtered by the status hook's own
 * matching — the point of a `SetProbe` is that the join decides what is
 * missing, not the caller. Each entry carries the `source` this probe needs
 * for the enumerable/flood split.
 *
 * Only ENUMERABLE, non-flood entries are used: `source === 'flood'` is
 * presence-only and can never back a removal, and `source === 'walk'` (indoor
 * scroll boundaries) belongs to `indoor-edge.set.ts`, whose removals depend on
 * whether `walkBoundaries`/`doorBoundaries` were read for this room — a
 * different gate than "was this pass available at all".
 */
import type { ConnectionRecord, ConnectionTag, ScreenId } from '@shared/game/data';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { unread } from '@shared/game/recommendations/compare';
import type { Probe, SetProbe } from '@shared/game/recommendations/compare';
import type { ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { buildConnectionRecord } from '../../../build-connection-record';
import { resolveRealDestId } from '../../../connection-audit-resolve';
import { findFloodForTarget } from '../../../connection-tile-display';
import { auditableFromHere, otherEndpoint, storedOnFarSide, transitionKey } from './screen-endpoint';

/** Sources the native room tables enumerate directly — an absence among
 *  these is provable. `flood` and `walk` are excluded; see the file header. */
const ENUMERABLE_SOURCES: ReadonlySet<string> = new Set(['exit', 'stair', 'travel', 'hole', 'entrance']);

const inferTags = (transition: ObservedTransition): ConnectionTag[] => {
  if (transition.source === 'stair') return ['transit:stairs', 'ctx:internal'];
  if (transition.source === 'hole') return ['transit:hole', 'ctx:entrance'];
  if (transition.source === 'travel') return ['transit:warp', 'ctx:internal'];
  // 'exit' (the overworld screen this room exits to) and 'entrance' (an
  // overworld door leading into a room) are both door crossings.
  return ['transit:door', 'ctx:entrance'];
};

/** Removal candidacy requires the backing table to have been read: indoors no
 *  source enumerates fall holes, so the absence of one proves nothing. Such a
 *  record is still matched by the far-side pair check, which is what keeps the
 *  live crossing from being proposed a second time. */
const unprovableIndoors = (observations: ScreenObservations, record: ConnectionRecord): boolean =>
  observations.isIndoors && (record.kind === 'hole' || record.kind === 'drop');

const readDataset = (observations: ScreenObservations, screenId: ScreenId | null): readonly ConnectionRecord[] => {
  if (!screenId) return [];
  return observations.existingConnections.filter(c => (
    c.kind !== 'edge' && !unprovableIndoors(observations, c) && auditableFromHere(screenId, c)
  ));
};

const readLive = (observations: ScreenObservations, screenId: ScreenId | null): Probe<readonly ObservedTransition[]> => {
  if (!observations.realAvailable) return unread();
  const here = readDataset(observations, screenId);
  // Dedupe by resolved key: two sources naming the same destination (e.g. a
  // stair AND a travel byte both landing on the same room) propose ONE
  // record, not two — `compareSet`'s own live loop does not dedupe its input.
  const seen = new Set<string>();
  const enumerable: ObservedTransition[] = [];
  for (const t of observations.realTransitions) {
    if (!ENUMERABLE_SOURCES.has(t.source)) continue;
    const key = transitionKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    if (storedOnFarSide(screenId, key, observations.existingConnections, here)) continue;
    enumerable.push(t);
  }
  return { known: true, value: enumerable };
};

const datasetKey = (record: ConnectionRecord, screenId: ScreenId | null): string =>
  (screenId ? otherEndpoint(screenId, record) : record.id);

const toProposed = (item: ObservedTransition, observations: ScreenObservations, screenId: ScreenId | null) => {
  if (!screenId) return null;
  const targetId = resolveRealDestId(item.kind, item.index);
  if (!targetId) return null;
  const tags = inferTags(item);
  const info = findFloodForTarget([...observations.floodConnections], targetId);
  const nav = info ? buildConnectionNav(info, tags) : undefined;
  return buildConnectionRecord({ screenId, toScreenId: targetId, tags, nav });
};

const CONNECTION_CROSSING_PROBE: SetProbe<'connection', ObservedTransition> = {
  id: 'connection-crossing',
  noun: 'crossing',
  readLive,
  readDataset,
  liveKey: transitionKey,
  datasetKey,
  toProposed,
  removable: true,
  source: 'native:room-transitions',
  confidence: 'certain',
  removalConfidence: 'likely',
};

export { CONNECTION_CROSSING_PROBE, inferTags };
