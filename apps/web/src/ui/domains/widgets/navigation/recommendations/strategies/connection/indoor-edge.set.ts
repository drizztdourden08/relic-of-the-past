/* @layer renderer-widgets @kind data */
/**
 * Fix 3 (phase 4, part 2): `buildBadFindings` (deleted) treated EVERY
 * `kind: 'edge'` connection as flood-only and refused to ever propose
 * removing one — correct for an OUTDOOR scroll edge (the flood proves
 * presence, never absence, and that reasoning is unchanged and must not be
 * weakened), but indoors the room's own walk-boundary table enumerates
 * every wall the room actually scrolls through, so an indoor edge IS
 * provable both ways once that table is read.
 *
 * Gated on `observations.walkBoundaries` AND `observations.doorBoundaries`
 * BOTH being present, not merely `realAvailable` — these are the two tables
 * this probe's safety depends on, read only for the CURRENT indoor room
 * (`use-screen-observations.ts`). `doorBoundaries` carries no destination of
 * its own (`LiveDoorBoundaryTile` has no `destRoom`), so it is never
 * consulted for identity here — only as a second "this room's exits were
 * actually queried" gate alongside `walkBoundaries`, so a room whose door
 * table was never read gets no removal proposal from this probe even if its
 * walk table happened to come back. This is deliberately conservative: a
 * batch accept is gated on `certain`, and getting this gate wrong would make
 * that unsafe.
 *
 * `realTransitions`' own `source: 'walk'` entries come from the SAME native
 * call (`wasmGetRoomWalkBoundaries`) but carry no signal of whether the door
 * table was also read, which is why this probe reads `walkBoundaries`
 * directly rather than reusing those entries — see `points.set.ts`'s header
 * for why that probe excludes `'walk'` sources entirely and leaves them here.
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
