/* @layer renderer-widgets @kind data */
/**
 * An OUTDOOR scroll edge is flood-only: the flood proves presence, never
 * absence, so it must never be proposed for removal. Indoors the room's own
 * walk-boundary table enumerates every wall the room scrolls through, so an
 * indoor edge IS provable both ways once that table is read.
 *
 * Gated on `observations.walkBoundaries` AND `observations.doorBoundaries`
 * BOTH being present, not merely `realAvailable`. `doorBoundaries` carries no
 * destination (`LiveDoorBoundaryTile` has no `destRoom`) and is only a second
 * "this room's exits were queried" gate. Deliberately conservative: a batch
 * accept is gated on `certain`, so getting this gate wrong would make it unsafe.
 *
 * `realTransitions`' own `source: 'walk'` entries come from the same native
 * call but carry no signal of whether the door table was also read, which is
 * why this probe reads `walkBoundaries` directly. `points.set.ts` excludes
 * `'walk'` sources entirely and leaves them here.
 */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import { unread } from '@shared/game/recommendations/compare';
import type { Probe, SetProbe } from '@shared/game/recommendations/compare';
import type { ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { buildConnectionRecord } from '../../../build-connection-record';
import { resolveRealDestId } from '../../../connection-audit-resolve';
import { auditableFromHere, otherEndpoint, transitionKey } from './screen-endpoint';

const readLive = (observations: ScreenObservations): Probe<readonly ObservedTransition[]> => {
  if (!observations.isIndoors || !observations.walkBoundaries || !observations.doorBoundaries) return unread();
  const seen = new Set<number>();
  const crossings: ObservedTransition[] = [];
  for (const boundary of observations.walkBoundaries) {
    if (boundary.destRoom === 0 || seen.has(boundary.destRoom)) continue;
    seen.add(boundary.destRoom);
    crossings.push({ source: 'walk-boundary', kind: 'room', index: boundary.destRoom });
  }
  return { known: true, value: crossings };
};

const readDataset = (observations: ScreenObservations, screenId: ScreenId | null): readonly ConnectionRecord[] => {
  if (!screenId || !observations.isIndoors) return [];
  return observations.existingConnections.filter(c => c.kind === 'edge' && auditableFromHere(screenId, c));
};

const datasetKey = (record: ConnectionRecord, screenId: ScreenId | null): string =>
  (screenId ? otherEndpoint(screenId, record) : record.id);

const toProposed = (item: ObservedTransition, observations: ScreenObservations, screenId: ScreenId | null) => {
  if (!screenId) return null;
  const targetId = resolveRealDestId(item.kind, item.index);
  if (!targetId) return null;
  return buildConnectionRecord({
    screenId, toScreenId: targetId, tags: ['transit:walk', 'ctx:internal'],
  });
};

const INDOOR_EDGE_PROBE: SetProbe<'connection', ObservedTransition> = {
  id: 'connection-indoor-edge',
  noun: 'indoor edge',
  readLive,
  readDataset,
  liveKey: transitionKey,
  datasetKey,
  toProposed,
  removable: true,
  source: 'native:room-boundaries',
  confidence: 'certain',
};

export { INDOOR_EDGE_PROBE };
