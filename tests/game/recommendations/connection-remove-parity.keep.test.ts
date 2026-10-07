/* @layer test @kind test */
/**
 * The connection strategy's REMOVE side against the real dataset, through the
 * same `CONNECTION_CROSSING_PROBE`/`INDOOR_EDGE_PROBE` pair the ADD test uses
 * (`connection-audit-core.ts`'s `buildBadFindings` is deleted).
 *
 * An OUTDOOR `kind: 'edge'` connection is never proposed for removal: the
 * flood proves presence, never absence. An INDOOR edge CAN be, once
 * `walkBoundaries`/`doorBoundaries` are both read (F3). A one-way record is
 * judged only from the screen that can observe it (F4); `canExit` on the
 * record says this directly (see `screen-endpoint.ts`).
 *
 * A `ConnectionRecord` needs a resolvable `toConnectionId` partner, so every
 * fixture mints a real pair through `registerRecord`/`unregisterRecord`.
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
 * A fixture point on `screenId` plus a registered partner on `toScreenId`.
 * `canExit` defaults `true`; `partnerCanExit` defaults to the same (two-way),
 * overridable for the one-way (F4) case.
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

  it('never proposes removing an OUTDOOR edge, because the flood cannot prove an absence', () => {
    const conn = fixtureConn({ kind: 'edge' });
    const context = contextFor('screen-a' as ScreenId, { isIndoors: false, existingConnections: [conn] });
    const drafts = detector.detect(context);
    expect(drafts.some(d => d.targetId === conn.id)).toBe(false);
  });

  it('never proposes removing an indoor edge unless BOTH boundary tables were read (F3)', () => {
    const conn = fixtureConn({ kind: 'edge' });
    const partiallyRead = contextFor('screen-a' as ScreenId, {
      isIndoors: true, existingConnections: [conn], walkBoundaries: [],
      // doorBoundaries absent, so the table half of F3's gate is missing.
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
    // One-way stairs: screen-a can exit, screen-b cannot leave back. screen-b's
    // audit must not remove it; `canExit: false` already says so.
    const conn = fixtureConn({ kind: 'stairs', canExit: true, toScreenId: 'screen-b' as ScreenId, partnerCanExit: false });
    const partner = getConnection(conn.toConnectionId);
    const fromTargetSide = contextFor('screen-b' as ScreenId, { existingConnections: [partner] });
    expect(detector.detect(fromTargetSide).some(d => d.targetId === partner.id)).toBe(false);
  });

  it('still finds something on the real dataset, so the fixture path is not the only path', () => {
    expect(all('connection').length).toBeGreaterThan(0);
  });
});
