/* @layer test @kind test */
/**
 * The shape detector against `connectionIssues`, on the real dataset.
 *
 * Two of the four warnings become recommendations and two deliberately do not,
 * so parity here means "agrees about what is wrong, and proposes a fix for
 * exactly the ones a fix can be computed for" — not "emits one draft per
 * warning". The obsolete transit check is pinned explicitly, because silently
 * dropping a check is the kind of thing that should fail loudly if it is ever
 * un-obsoleted.
 */
import { describe, it, expect } from 'vitest';
import { all, connectionTagKeysOf, find } from '@shared/game/data';
import type { ConnectionRecord, ScreenId, ScreenRecord } from '@shared/game/data';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { CONNECTION_ISSUE, connectionIssues } from '@app/ui/domains/widgets/navigation/connection-issues';
import { describeConnectionTiles, findFloodForTarget } from '@app/ui/domains/widgets/navigation/connection-tile-display';
import { connectionShapeDetector } from '@app/ui/domains/widgets/navigation/recommendations/detectors/connection-shape';

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
  const view = { from: conn.fromScreenId, to: conn.toScreenId, tags, nav: conn.nav };
  return connectionIssues({ from: view.from, to: view.to, tags }, describeConnectionTiles(view, [...flood], screenId));
};

const infoFor = (targetScreen: number): ConnectionInfo =>
  ({ edge: 'north', targetScreen, freeTileCount: 4, itemTileCount: 0, positions: [10, 11], requirements: [] });

/**
 * A real connection whose destination a flood crossing can actually be matched
 * to. The matcher resolves a raw index back to a screen id, and a room index
 * shared by several records resolves to whichever one the lookup picks first —
 * so the pair is discovered rather than assumed.
 */
const floodBackedConnection = (connections: readonly ConnectionRecord[]): { conn: ConnectionRecord; info: ConnectionInfo } | null => {
  for (const conn of connections) {
    const target = all('screen').find(s => s.id === conn.toScreenId);
    for (const index of [target?.gameId.roomIndex, target?.gameId.overworldIndex]) {
      if (index == null) continue;
      const info = infoFor(index);
      if (findFloodForTarget([info], conn.toScreenId) === info) return { conn, info };
    }
  }
  return null;
};

/**
 * A screen with several outgoing connections, at least one of which a flood
 * crossing can be matched to — so both halves of the detector have something
 * real to work on.
 */
const screenWithConnections = () => {
  let fallback: { screen: ScreenRecord; connections: ConnectionRecord[] } | null = null;
  for (const screen of all('screen')) {
    const connections = find('connection', c => c.fromScreenId === screen.id);
    if (connections.length <= 1) continue;
    if (!fallback) fallback = { screen, connections };
    if (floodBackedConnection(connections)) return { screen, connections };
  }
  if (!fallback) throw new Error('dataset has no screen with several outgoing connections');
  return fallback;
};

describe('connection-shape detector parity with connectionIssues', () => {
  const { screen, connections } = screenWithConnections();
  const context = contextFor(screen.id, connections);
  const drafts = connectionShapeDetector.detect(context);

  it('agrees the real records are missing tile data', () => {
    for (const conn of connections) {
      expect(issuesFor(conn, [], screen.id)).toContain(CONNECTION_ISSUE.noTileData);
    }
  });

  it('proposes nothing for a missing-tile warning no flood crossing can fix', () => {
    // Every one of them is flagged, and none is proposed — absence of flood
    // coverage is not evidence, so there is nothing safe to attach.
    expect(drafts.filter(d => d.key === 'nav')).toEqual([]);
  });

  const backing = floodBackedConnection(connections);

  it('finds a flood-backed connection to compare — the fixture is not vacuously green', () => {
    expect(backing).not.toBeNull();
  });

  it('still proposes a nav once the display stops warning, because the record is unchanged', () => {
    if (!backing) return;
    // `connectionIssues` goes quiet as soon as the live flood covers the
    // crossing — that is a statement about the display, not about the record,
    // and the record is exactly what a recommendation writes.
    expect(issuesFor(backing.conn, [backing.info], screen.id)).not.toContain(CONNECTION_ISSUE.noTileData);
    expect(backing.conn.nav).toBeUndefined();
    expect(connectionShapeDetector.detect(contextFor(screen.id, [backing.conn], [backing.info])).some(d => d.key === 'nav')).toBe(true);
  });

  it('proposes the flood-derived nav for the one crossing the flood does back', () => {
    if (!backing) return;
    const backed = connectionShapeDetector.detect(contextFor(screen.id, [backing.conn], [backing.info]));
    const navDrafts = backed.filter(d => d.key === 'nav');
    expect(navDrafts.length).toBeGreaterThan(0);
    for (const d of navDrafts) {
      // Flood evidence proves presence only — it can never be graded certain.
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
      nav: { transitType: 'walk', requirements: [], bidirectional: true, weight: 1 },
    };
    expect(connectionShapeDetector.detect(contextFor(screen.id, [persisted], [backing.info])).filter(d => d.key === 'nav')).toEqual([]);
  });

  it('never proposes a direction fix on real data, because every record has a dir tag', () => {
    for (const conn of all('connection')) {
      expect(issuesFor(conn, [], screen.id)).not.toContain(CONNECTION_ISSUE.noDirection);
    }
    expect(drafts.filter(d => d.key === 'tags.dir')).toEqual([]);
  });

  it('derives the dir tag from the record when one really is missing', () => {
    const stripped: ConnectionRecord = { ...connections[0], tags: [] };
    expect(issuesFor(stripped, [], screen.id)).toContain(CONNECTION_ISSUE.noDirection);

    const [fix] = connectionShapeDetector.detect(contextFor(screen.id, [stripped])).filter(d => d.key === 'tags.dir');
    expect(fix.confidence).toBe('certain');
    expect(connectionTagKeysOf((fix.proposed as ConnectionRecord).tags)).toContain(`dir:${stripped.direction}`);
  });

  it('leaves the obsolete transit warning as a warning — kind already carries it', () => {
    // The migration promoted transit:door/stairs/hole/warp/mirror/walk/swim into
    // ConnectionRecord.kind, so this fires on nearly every record and means
    // nothing. If that ever stops being true, this test should be revisited.
    const flagged = all('connection').filter(c => issuesFor(c, [], screen.id).includes(CONNECTION_ISSUE.noTransitType));
    expect(flagged.length).toBeGreaterThan(all('connection').length * 0.9);
    expect(drafts.some(d => d.key?.includes('transit'))).toBe(false);
  });

  it('proposes nothing for an unresolvable endpoint rather than inventing one', () => {
    const broken: ConnectionRecord = { ...connections[0], toScreenId: 'screen-999999' as ScreenId };
    expect(issuesFor(broken, [], screen.id).some(i => i.includes('unknown screen'))).toBe(true);
    expect(connectionShapeDetector.detect(contextFor(screen.id, [broken]))).toEqual([]);
  });
});
