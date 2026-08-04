/* @layer test @kind test */
/**
 * The connection strategy's ADD side against the real dataset.
 *
 * Phase 4, part 2 replaced `connection-audit-core.ts`'s `buildAddFindings`
 * (and the `connection-add` detector that wrapped it, both deleted) with
 * `CONNECTION_CROSSING_PROBE` (`points.set.ts`), expressed generically
 * through `detectorFromStrategy` instead of a hand-rolled comparison — so
 * there is no longer an "original mechanism" to diff against. This exercises
 * the new detector (strategy + its `onUnresolvableConnection` mapper)
 * directly and pins the properties the deleted parity test cared about: a
 * create proposal names the right destination, mints no id, and grades a
 * native crossing `certain` — plus the two behaviours this phase actually
 * changed: a resolved destination is judged by the join, not a pre-filtered
 * list, and an UNRESOLVABLE destination now proposes a screen instead of
 * vanishing (F2).
 */
import { describe, it, expect } from 'vitest';
import { all, findOne, registerRecord, unregisterRecord } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ConnectionId, ScreenId, ScreenRecord } from '@shared/game/data';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { resolveRealDestId } from '@app/ui/domains/widgets/navigation/connection-audit-resolve';
import { connectionStrategy } from '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/connection.strategy';
import { onUnresolvableConnection } from '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/unresolvable-screen';

const detector = detectorFromStrategy(connectionStrategy, onUnresolvableConnection);

const connected = (a: ScreenId, b: ScreenId): boolean =>
  findOne('connection', c => (c.screenId === a && toScreenIdOf(c) === b) || (c.screenId === b && toScreenIdOf(c) === a)) != null;

// A bare room index can be ambiguous (a castle room and an unrelated cave can
// share one) — this project's own hard rule. The fixture needs a destination
// whose room index resolves UNAMBIGUOUSLY back to itself via the same
// `resolveRealDestId` the probe under test uses, or the assertions below
// would be pinned to whichever screen the lookup happens to prefer instead.
const resolvesToItself = (screen: ScreenRecord): boolean =>
  screen.gameId.roomIndex != null && resolveRealDestId('room', screen.gameId.roomIndex) === screen.id;

/** Two real screens with no edge between them — a stair the dataset does not
 *  map is exactly the finding the add side exists for. */
const unmappedPair = (): { from: ScreenRecord; to: ScreenRecord } => {
  const rooms = all('screen').filter(s => s.gameId.roomIndex != null && resolvesToItself(s));
  for (const from of rooms) {
    const to = rooms.find(r => r.id !== from.id && !connected(from.id, r.id));
    if (to) return { from, to };
  }
  throw new Error('dataset has no unmapped, unambiguously-resolving room pair');
};

const baseObservations = (): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  isDarkWorld: false,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
});

const contextFor = (screenId: ScreenId, observations: Partial<ScreenObservations>): DetectionContext => (
  { origin: 'live', screenId, observations: { ...baseObservations(), ...observations } }
);

describe('connection strategy ADD side (SetProbe) against the real dataset', () => {
  const { from, to } = unmappedPair();
  const destRoom = to.gameId.roomIndex!;
  const context = contextFor(from.id, { realTransitions: [{ source: 'stair', kind: 'room', index: destRoom }] });

  const drafts = detector.detect(context).filter(d => d.kind === 'connection');

  it('finds something to compare — the fixture is not vacuously green', () => {
    expect(drafts.length).toBeGreaterThan(0);
  });

  it('proposes a create for the real, resolvable destination', () => {
    expect(drafts[0].action).toBe('create');
    expect(drafts[0].targetId).toBeNull();
    expect(drafts[0].current).toBeNull();
    expect(drafts[0].proposed).not.toHaveProperty('id');
    // The destination is named in the finding's own key (the crossing probe's
    // `datasetKey`/`liveKey` resolve to the destination screen id), not on the
    // proposed record itself — a brand-new crossing has no existing partner to
    // link to yet, so `proposed.toConnectionId` is a placeholder (see
    // `build-connection-record.ts`'s own header).
    expect(drafts[0].key).toContain(to.id);
  });

  it('grades a native crossing certain', () => {
    expect(drafts.every(d => d.confidence === 'certain')).toBe(true);
  });

  it('proposes nothing once a covering record exists', () => {
    // The dataset key resolves through `toConnectionId` to the PARTNER's own
    // screen (see `data/connections/derive.ts`), so the fixture's partner has
    // to be a real, registered record for the join to see it as covering `to`.
    const partnerId = 'connection-fixture-partner' as ConnectionId;
    registerRecord('connection', {
      id: partnerId, kind: 'stairs', screenId: to.id, toConnectionId: 'connection-fixture' as ConnectionId,
      placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } }, canExit: true, tags: [],
    } as never);
    try {
      const covered = detector.detect(contextFor(from.id, {
        realTransitions: [{ source: 'stair', kind: 'room', index: destRoom }],
        existingConnections: [{
          id: 'connection-fixture', kind: 'stairs', screenId: from.id, toConnectionId: partnerId,
          placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } }, canExit: true, tags: [],
        } as never],
      })).filter(d => d.kind === 'connection');
      expect(covered).toEqual([]);
    } finally {
      unregisterRecord('connection', partnerId);
    }
  });

  it('stays silent when the room tables were never read', () => {
    expect(detector.detect(contextFor(from.id, {
      realTransitions: [{ source: 'stair', kind: 'room', index: destRoom }],
      realAvailable: false,
    })).filter(d => d.kind === 'connection')).toEqual([]);
  });

  it('proposes a screen create for an unresolvable destination (F2) instead of dropping it', () => {
    const unresolvedRoom = 0xfffe; // no screen catalogues this room index
    const found = detector.detect(contextFor(from.id, {
      realTransitions: [{ source: 'stair', kind: 'room', index: unresolvedRoom }],
    }));
    const screenCreate = found.find(d => d.kind === 'screen');
    expect(screenCreate).toBeDefined();
    expect(screenCreate?.action).toBe('create');
    expect(screenCreate?.confidence).toBe('likely'); // room destination, palace unknown
  });
});
