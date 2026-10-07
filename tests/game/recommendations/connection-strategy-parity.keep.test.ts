/* @layer test @kind test */
/**
 * The `connection` strategy's nav probe (`connection-shape.ts` is deleted).
 * The direction-tag detector is gone with the `dir:*` namespace; direction
 * derives from `canExit` (see `data/connections/derive.ts`).
 */
import { describe, it, expect } from 'vitest';
import { all, connectionTagKeysOf, find } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ConnectionRecord, ScreenId, ScreenRecord } from '@shared/game/data';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { CONNECTION_ISSUE, connectionIssues } from '@app/ui/domains/widgets/navigation/connection-issues';
import { describeConnectionTiles, findFloodForTarget } from '@app/ui/domains/widgets/navigation/connection-tile-display';
import { connectionStrategy } from '@app/ui/domains/widgets/navigation/recommendations/strategies/connection/connection.strategy';
import { describeDataset } from '../../dataset-guard';

const navDetector = detectorFromStrategy(connectionStrategy);

const contextFor = (
  screenId: ScreenId,
  existingConnections: readonly ConnectionRecord[],
  floodConnections: readonly ConnectionInfo[] = [],
): DetectionContext => {
  const observations: ScreenObservations = {
    match: null,
    liveGameId: null,
    isIndoors: false,
    realTransitions: [],
    realAvailable: true,
    unmatchedCrossings: [],
    floodConnections,
    existingConnections,
    palaceMismatches: [],
  };
  return { origin: 'live', screenId, observations };
};

/** The original mechanism, driven exactly as the widget drives it. */
const issuesFor = (conn: ConnectionRecord, flood: readonly ConnectionInfo[], screenId: ScreenId): string[] => {
  const tags = connectionTagKeysOf(conn.tags);
  const view = { from: conn.screenId, to: toScreenIdOf(conn), tags, nav: conn.nav };
  return connectionIssues({ from: view.from, to: view.to, tags }, describeConnectionTiles(view, [...flood], screenId));
};

const infoFor = (targetScreen: number): ConnectionInfo =>
  ({ edge: 'north', targetScreen, freeTileCount: 4, itemTileCount: 0, positions: [10, 11], requirements: [] });

const floodBackedConnection = (connections: readonly ConnectionRecord[]): { conn: ConnectionRecord; info: ConnectionInfo } | null => {
  for (const conn of connections) {
    const toId = toScreenIdOf(conn);
    const target = all('screen').find(s => s.id === toId);
    for (const index of [target?.gameId.roomIndex, target?.gameId.overworldIndex]) {
      if (index == null) continue;
      const info = infoFor(index);
      if (findFloodForTarget([info], toId) === info) return { conn, info };
    }
  }
  return null;
};

const screenWithConnections = () => {
  let fallback: { screen: ScreenRecord; connections: ConnectionRecord[] } | null = null;
  for (const screen of all('screen')) {
    const connections = find('connection', c => c.screenId === screen.id);
    if (connections.length <= 1) continue;
    if (!fallback) fallback = { screen, connections };
    if (floodBackedConnection(connections)) return { screen, connections };
  }
  if (!fallback) throw new Error('dataset has no screen with several outgoing connections');
  return fallback;
};

describeDataset('connection strategy (nav probe) parity with connectionIssues', () => {
  const { screen, connections } = screenWithConnections();
  const drafts = navDetector.detect(contextFor(screen.id, connections));

  it('agrees the real records are missing tile data', () => {
    for (const conn of connections) {
      expect(issuesFor(conn, [], screen.id)).toContain(CONNECTION_ISSUE.noTileData);
    }
  });

  it('proposes nothing for a missing-tile warning no flood crossing can fix', () => {
    expect(drafts.filter(d => d.key === 'nav')).toEqual([]);
  });

  const backing = floodBackedConnection(connections);

  it('finds a flood-backed connection to compare, so the fixture is not vacuously green', () => {
    expect(backing).not.toBeNull();
  });

  it('still proposes a nav once the display stops warning, because the record is unchanged', () => {
    if (!backing) return;
    expect(issuesFor(backing.conn, [backing.info], screen.id)).not.toContain(CONNECTION_ISSUE.noTileData);
    expect(backing.conn.nav).toBeUndefined();
    expect(navDetector.detect(contextFor(screen.id, [backing.conn], [backing.info])).some(d => d.key === 'nav')).toBe(true);
  });

  it('proposes the flood-derived nav for the one crossing the flood does back', () => {
    if (!backing) return;
    const backed = navDetector.detect(contextFor(screen.id, [backing.conn], [backing.info]));
    const navDrafts = backed.filter(d => d.key === 'nav');
    expect(navDrafts.length).toBeGreaterThan(0);
    for (const d of navDrafts) {
      // Flood evidence proves presence only, so it can never be graded certain.
      expect(d.confidence).toBe('likely');
      expect(d.action).toBe('update');
      expect((d.proposed as ConnectionRecord).nav).toBeDefined();
      expect((d.current as ConnectionRecord).nav).toBeUndefined();
      expect(issuesFor(d.current as ConnectionRecord, [], screen.id)).toContain(CONNECTION_ISSUE.noTileData);
    }
  });

  it('proposes no nav for a record that already has one', () => {
    if (!backing) return;
    const persisted: ConnectionRecord = {
      ...backing.conn,
      nav: { transitType: 'walk', requirements: [], weight: 1 },
    };
    expect(navDetector.detect(contextFor(screen.id, [persisted], [backing.info])).filter(d => d.key === 'nav')).toEqual([]);
  });

  it('proposes no NAV fix for an unresolvable endpoint instead of inventing one', () => {
    const broken: ConnectionRecord = { ...connections[0], toConnectionId: 'connection-999999' as ConnectionRecord['toConnectionId'] };
    expect(issuesFor(broken, [], screen.id).some(i => i.includes('unknown screen'))).toBe(true);
    // Filtered to the nav probe's own findings: the crossing `SetProbe`s are
    // right to flag a record pointing at a nonexistent screen, a different finding.
    expect(navDetector.detect(contextFor(screen.id, [broken])).filter(d => d.key === 'nav')).toEqual([]);
  });
});
