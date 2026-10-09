/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { all, findOne, registerRecord, unregisterRecord, toScreenIdOf } from '@rotp/game-data';
import type { ConnectionId, ScreenId, ScreenRecord } from '@rotp/game-data';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import { detectorFromStrategy } from '@rotp/navigation';
import { resolveRealDestId } from '@app/nav-widget/connection-audit-resolve';
import { connectionStrategy } from '@app/nav-widget/recommendations/strategies/connection/connection.strategy';
import { onUnresolvableConnection } from '@app/nav-widget/recommendations/strategies/connection/unresolvable-screen';
import { describeDataset } from '../../dataset-guard';

const detector = detectorFromStrategy(connectionStrategy, onUnresolvableConnection);

const connected = (a: ScreenId, b: ScreenId): boolean =>
  findOne('connection', c => (c.screenId === a && toScreenIdOf(c) === b) || (c.screenId === b && toScreenIdOf(c) === a)) != null;

const resolvesToItself = (screen: ScreenRecord): boolean =>
  screen.gameId.roomIndex != null && resolveRealDestId('room', screen.gameId.roomIndex) === screen.id;

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

describeDataset('connection strategy ADD side (SetProbe) against the real dataset', () => {
  const { from, to } = unmappedPair();
  const destRoom = to.gameId.roomIndex!;
  const context = contextFor(from.id, { realTransitions: [{ source: 'stair', kind: 'room', index: destRoom }] });

  const drafts = detector.detect(context).filter(d => d.kind === 'connection');

  it('finds something to compare, so the fixture is not vacuously green', () => {
    expect(drafts.length).toBeGreaterThan(0);
  });

  it('proposes a create for the real, resolvable destination', () => {
    expect(drafts[0].action).toBe('create');
    expect(drafts[0].targetId).toBeNull();
    expect(drafts[0].current).toBeNull();
    expect(drafts[0].proposed).not.toHaveProperty('id');
    expect(drafts[0].key).toContain(to.id);
  });

  it('grades a native crossing certain', () => {
    expect(drafts.every(d => d.confidence === 'certain')).toBe(true);
  });

  it('proposes nothing once a covering record exists', () => {
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
    const unresolvedRoom = 0xfffe;
    const found = detector.detect(contextFor(from.id, {
      realTransitions: [{ source: 'stair', kind: 'room', index: unresolvedRoom }],
    }));
    const screenCreate = found.find(d => d.kind === 'screen');
    expect(screenCreate).toBeDefined();
    expect(screenCreate?.action).toBe('create');
    expect(screenCreate?.confidence).toBe('likely');
  });
});
