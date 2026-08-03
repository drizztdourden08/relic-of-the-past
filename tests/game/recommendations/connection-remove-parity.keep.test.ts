/* @layer test @kind test */
/**
 * The remove detector against the mechanism it wraps, on the real dataset.
 *
 * The assertion that matters most is the LAST one: `kind: 'edge'` connections
 * are backed by flood evidence, which proves presence and never absence, so
 * neither the original audit nor the detector may ever propose removing one.
 */
import { describe, it, expect } from 'vitest';
import { all, find } from '@shared/game/data';
import type { ConnectionRecord, ScreenId, ScreenRecord } from '@shared/game/data';
import type { DetectionContext, ObservedTransition, ScreenObservations } from '@shared/game/recommendations';
import { buildBadFindings } from '@app/ui/domains/widgets/navigation/connection-audit-core';
import { connectionRemoveDetector } from '@app/ui/domains/widgets/navigation/recommendations/detectors/connection-remove';

const outgoing = (screen: ScreenRecord, predicate: (c: ConnectionRecord) => boolean): ConnectionRecord[] =>
  find('connection', c => c.fromScreenId === screen.id && c.toScreenId !== screen.id && predicate(c));

/** A real screen with at least one auditable (non-edge) outgoing connection. */
const screenWithAuditableEdges = (): ScreenRecord => {
  const screen = all('screen').find(s => outgoing(s, c => c.kind !== 'edge').length > 0);
  if (!screen) throw new Error('dataset has no screen with a non-edge outgoing connection');
  return screen;
};

/** A real screen with an outgoing scroll edge, which must never be proposed for removal. */
const screenWithScrollEdge = (): ScreenRecord | undefined =>
  all('screen').find(s => outgoing(s, c => c.kind === 'edge').length > 0);

/**
 * A real transition that resolves (so the audit's "can I judge this at all?"
 * guard passes) but backs nothing this screen actually points at — which is
 * exactly the situation the audit exists to report.
 */
const unrelatedTransitions = (exclude: ReadonlySet<number>): ObservedTransition[] => {
  const room = all('screen')
    .map(s => s.gameId.roomIndex)
    .find((index): index is number => index != null && !exclude.has(index));
  if (room == null) throw new Error('dataset has no spare room index');
  return [{ source: 'test:room-table', kind: 'room', index: room }];
};

const contextFor = (screenId: ScreenId, realTransitions: ObservedTransition[]): DetectionContext => {
  const observations: ScreenObservations = {
    match: null,
    liveGameId: null,
    isIndoors: true,
    realTransitions,
    realAvailable: true,
    unmatchedCrossings: [],
    floodConnections: [],
    existingConnections: [],
    palaceMismatches: [],
  };
  return { origin: 'live', screenId, observations };
};

const pairsOf = (items: readonly { fromScreenId: string; toScreenId: string }[]): string[] =>
  items.map(i => `${i.fromScreenId}->${i.toScreenId}`).sort();

describe('connection-remove detector parity with the connection audit', () => {
  const screen = screenWithAuditableEdges();
  const destRooms = new Set(
    outgoing(screen, () => true)
      .map(c => all('screen').find(s => s.id === c.toScreenId)?.gameId.roomIndex)
      .filter((n): n is number => n != null),
  );
  const transitions = unrelatedTransitions(destRooms);
  const context = contextFor(screen.id, transitions);

  const original = buildBadFindings(screen.id, transitions);
  const drafts = connectionRemoveDetector.detect(context);

  it('finds something to compare — the fixture is not vacuously green', () => {
    expect(original.length).toBeGreaterThan(0);
  });

  it('flags exactly the connections the original mechanism flags', () => {
    expect(pairsOf(drafts.map(d => d.current as ConnectionRecord))).toEqual(pairsOf(original));
  });

  it('carries the real record id as the delete target, not a re-derived match', () => {
    const originalIds = original.map(f => (f.record as ConnectionRecord).id).sort();
    expect(drafts.map(d => d.targetId).sort()).toEqual(originalIds);
  });

  it('proposes a delete backed by native-table evidence, graded certain', () => {
    for (const d of drafts) {
      expect(d.action).toBe('delete');
      expect(d.confidence).toBe('certain');
      expect(d.evidence[0].source).toBe('native:room-transitions');
      expect(d.reason).toBe(original.find(o => (o.record as ConnectionRecord).id === d.targetId)?.reason);
    }
  });

  it('never proposes removing a scroll edge — the flood cannot prove an absence', () => {
    const withEdge = screenWithScrollEdge();
    if (!withEdge) return;
    const edges = outgoing(withEdge, c => c.kind === 'edge');
    const spare = unrelatedTransitions(new Set());
    const fromDetector = connectionRemoveDetector.detect(contextFor(withEdge.id, spare));
    const flagged = new Set(fromDetector.map(d => d.targetId));

    expect(buildBadFindings(withEdge.id, spare).some(f => (f.record as ConnectionRecord).kind === 'edge')).toBe(false);
    for (const edge of edges) expect(flagged.has(edge.id)).toBe(false);
  });

  it('stays silent when the room tables were never read', () => {
    const unread = contextFor(screen.id, transitions);
    expect(connectionRemoveDetector.detect({ ...unread, observations: { ...unread.observations, realAvailable: false } })).toEqual([]);
  });
});
