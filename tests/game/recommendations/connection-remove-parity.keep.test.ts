/* @layer test @kind test */
/**
 * The connection strategy's REMOVE side against the real dataset.
 *
 * Phase 4, part 2 replaced `connection-audit-core.ts`'s `buildBadFindings`
 * (and the `connection-remove` detector that wrapped it, both deleted) with
 * the same `CONNECTION_CROSSING_PROBE`/`INDOOR_EDGE_PROBE` pair the ADD test
 * exercises. The assertion that matters most is still the one the deleted
 * test cared about: an OUTDOOR `kind: 'edge'` connection is never proposed
 * for removal, because the flood proves presence, never absence — that
 * reasoning is unchanged. What is NEW here: an INDOOR edge, once
 * `walkBoundaries`/`doorBoundaries` are both read, now CAN be (F3); and a
 * one-way record arriving at a screen is judged only from the screen that
 * can actually observe it, never removed by the OTHER endpoint's audit (F4)
 * — `canExit` on the record ITSELF now says this directly, with no more
 * cross-endpoint reasoning needed (see `screen-endpoint.ts`).
 *
 * A `ConnectionRecord` now always needs a resolvable `toConnectionId`
 * partner (see `data/connections/derive.ts`), so every fixture here mints a
 * real pair through `registerRecord`/`unregisterRecord` rather than a bare
 * object literal — the same pattern `check-presence.keep.test.ts` uses for
 * a temporary dataset fixture.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { all, getConnection, registerRecord, unregisterRecord } from '@shared/game/data';
import type { ConnectionId, ConnectionRecord, ScreenId } from '@shared/game/data';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/connection.strategy';
import { onUnresolvableConnection } from '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/unresolvable-screen';
import { describeDataset } from '../../dataset-guard';

const detector = detectorFromStrategy(connectionStrategy, onUnresolvableConnection);

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

const EMPTY_PLACEMENT = { form: 'area' as const, tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } };

let fixtureCount = 0;
const registered: ConnectionId[] = [];

afterEach(() => {
  for (const id of registered.splice(0)) unregisterRecord('connection', id);
});

/**
 * A fixture point on `screenId` plus a registered partner on `toScreenId`, so
 * `toConnectionId` resolves like a real dataset record does. `canExit`
 * defaults `true`; `partnerCanExit` defaults to the same value (a two-way
 * crossing), overridable for the one-way (F4) case below.
 */
const fixtureConn = (overrides: Partial<ConnectionRecord> & {
  toScreenId?: ScreenId; partnerCanExit?: boolean;
} = {}): ConnectionRecord => {
  const { toScreenId = 'screen-b' as ScreenId, partnerCanExit, ...rest } = overrides;
  const n = fixtureCount++;
  const id = (rest.id as ConnectionId) ?? (`connection-fixture-${n}` as ConnectionId);
  const partnerId = `connection-fixture-partner-${n}` as ConnectionId;
  const canExit = rest.canExit ?? true;
  const conn: ConnectionRecord = {
    id,
    kind: 'stairs',
    screenId: 'screen-a' as ScreenId,
    toConnectionId: partnerId,
    placement: EMPTY_PLACEMENT,
    canExit,
    tags: [],
    ...rest,
  };
  const partner: ConnectionRecord = {
    id: partnerId,
    kind: conn.kind,
    screenId: toScreenId,
    toConnectionId: conn.id,
    placement: EMPTY_PLACEMENT,
    canExit: partnerCanExit ?? canExit,
    tags: [],
  };
  registerRecord('connection', conn);
  registerRecord('connection', partner);
  registered.push(conn.id, partner.id);
  return conn;
};

describeDataset('connection strategy REMOVE side (SetProbe) against the real dataset', () => {
  it('proposes a delete for a non-edge record no real transition backs', () => {
    const conn = fixtureConn({ kind: 'stairs' });
    const context = contextFor('screen-a' as ScreenId, {
      existingConnections: [conn],
      realTransitions: [{ source: 'stair', kind: 'room', index: 0x999 }], // resolves to nothing, backs nothing
    });
    const drafts = detector.detect(context).filter(d => d.action === 'delete');
    expect(drafts.some(d => d.targetId === conn.id)).toBe(true);
    expect(drafts.find(d => d.targetId === conn.id)?.confidence).toBe('certain');
  });

  it('never proposes removing an OUTDOOR edge — the flood cannot prove an absence', () => {
    const conn = fixtureConn({ kind: 'edge' });
    const context = contextFor('screen-a' as ScreenId, { isIndoors: false, existingConnections: [conn] });
    const drafts = detector.detect(context);
    expect(drafts.some(d => d.targetId === conn.id)).toBe(false);
  });

  it('never proposes removing an indoor edge unless BOTH boundary tables were read (F3)', () => {
    const conn = fixtureConn({ kind: 'edge' });
    const partiallyRead = contextFor('screen-a' as ScreenId, {
      isIndoors: true, existingConnections: [conn], walkBoundaries: [],
      // doorBoundaries absent — the table half of F3's gate is missing.
    });
    expect(detector.detect(partiallyRead).some(d => d.targetId === conn.id)).toBe(false);
  });

  it('proposes removing an indoor edge once both boundary tables are read and back nothing', () => {
    const conn = fixtureConn({ kind: 'edge' });
    const context = contextFor('screen-a' as ScreenId, {
      isIndoors: true, existingConnections: [conn], walkBoundaries: [], doorBoundaries: [],
    });
    const drafts = detector.detect(context);
    expect(drafts.some(d => d.targetId === conn.id && d.action === 'delete')).toBe(true);
  });

  it('judges a one-way record only from the screen that can observe it (F4)', () => {
    // A one-way stairs: the point on screen-a can exit; its partner on
    // screen-b cannot leave back. screen-b's own audit must not remove the
    // record just because screen-b's tables do not back it — `canExit: false`
    // already says this side was never traversable from here.
    const conn = fixtureConn({ kind: 'stairs', canExit: true, toScreenId: 'screen-b' as ScreenId, partnerCanExit: false });
    const partner = getConnection(conn.toConnectionId);
    const fromTargetSide = contextFor('screen-b' as ScreenId, { existingConnections: [partner] });
    expect(detector.detect(fromTargetSide).some(d => d.targetId === partner.id)).toBe(false);
  });

  it('still finds something on the real dataset — the fixture path is not the only path', () => {
    expect(all('connection').length).toBeGreaterThan(0);
  });
});
