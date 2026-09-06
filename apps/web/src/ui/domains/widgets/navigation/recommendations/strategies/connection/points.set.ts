/* @layer renderer-widgets @kind data */
/**
 * The connection add/remove pair as ONE `SetProbe`, so cardinality and the
 * missing/unresolvable/unbacked split fall out of `compareSet`'s join instead
 * of being hand-written twice.
 *
 * Live set: `observations.realTransitions`, NOT `unmatchedCrossings`. The
 * latter is already pre-filtered by `useConnectionStatus`'s matching, which
 * would make this probe's own join redundant. `realTransitions` is also more
 * complete (it folds in travel-destination bytes and the flood on top of the
 * exit/stair/hole tables) and tags each entry with a `source`.
 *
 * Only ENUMERABLE, non-flood entries are used: `source === 'flood'` is
 * presence-only and can never back a `certain` removal, and `source === 'walk'`
 * (indoor scroll boundaries) gets its own probe (`indoor-edge.set.ts`) because
 * its removability depends on whether `walkBoundaries`/`doorBoundaries` were
 * read for this room (F3).
 */
import type { ConnectionRecord, ConnectionTag, ScreenId } from '@shared/game/data';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { unread } from '@shared/game/recommendations/compare';
import type { Probe, SetProbe } from '@shared/game/recommendations/compare';
import type { ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { buildConnectionRecord } from '../../../build-connection-record';
import { resolveRealDestId } from '../../../connection-audit-resolve';
import { findFloodForTarget } from '../../../connection-tile-display';
import { auditableFromHere, otherEndpoint, transitionKey } from './screen-endpoint';

/** Sources the native room tables enumerate directly, so an absence among
 *  them is provable. `flood` and `walk` are excluded; see the file header. */
const ENUMERABLE_SOURCES: ReadonlySet<string> = new Set(['exit', 'stair', 'travel', 'hole', 'entrance']);

const inferTags = (transition: ObservedTransition): ConnectionTag[] => {
  if (transition.source === 'stair') return ['transit:stairs', 'ctx:internal'];
  if (transition.source === 'hole') return ['transit:hole', 'ctx:entrance'];
  if (transition.source === 'travel') return ['transit:walk', 'ctx:internal'];
  // 'exit' (the overworld screen this room exits to) and 'entrance' (an
  // overworld door leading into a room) are both door crossings.
  return ['transit:door', 'ctx:entrance'];
};

const readLive = (observations: ScreenObservations): Probe<readonly ObservedTransition[]> => {
  if (!observations.realAvailable) return unread();
  // Dedupe by resolved key: two sources naming the same destination (a stair
  // AND a travel byte) propose ONE record. `compareSet` does not dedupe its input.
  const seen = new Set<string>();
  const enumerable: ObservedTransition[] = [];
  for (const t of observations.realTransitions) {
    if (!ENUMERABLE_SOURCES.has(t.source)) continue;
    const key = transitionKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    enumerable.push(t);
  }
  return { known: true, value: enumerable };
};

const readDataset = (observations: ScreenObservations, screenId: ScreenId | null): readonly ConnectionRecord[] => {
  if (!screenId) return [];
  return observations.existingConnections.filter(c => c.kind !== 'edge' && auditableFromHere(screenId, c));
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
};

export { CONNECTION_CROSSING_PROBE, inferTags };
