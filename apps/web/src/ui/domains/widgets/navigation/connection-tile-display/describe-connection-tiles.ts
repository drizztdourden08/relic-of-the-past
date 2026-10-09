/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo, ConnectionNavData } from '@shared/game/navigation';
import { matchFlood } from './match-flood';

const describeNav = (nav: ConnectionNavData): string | null => {
  if (nav.overlapTiles && nav.overlapTiles.length > 0) return `tiles: [${nav.overlapTiles.join(', ')}]`;
  if (nav.fromPoint?.position) return `entry: (${nav.fromPoint.position.row}, ${nav.fromPoint.position.col})`;
  if (nav.fromPoint && nav.fromPoint.tiles.length > 0) return `tiles: [${nav.fromPoint.tiles.join(', ')}]`;
  return null;
};

const describeFlood = (info: ConnectionInfo): string | null => {
  if (info.positions.length === 0) return null;
  return `tiles: [${info.positions.join(', ')}]`;
};

const describeConnectionTiles = (
  conn: { from: string; to: string; nav?: ConnectionNavData },
  floodConnections: ConnectionInfo[],
  screenId: string | null,
): string | null => {
  if (conn.nav) {
    const fromNav = describeNav(conn.nav);
    if (fromNav) return fromNav;
  }
  const info = matchFlood(conn, floodConnections, screenId);
  return info ? describeFlood(info) : null;
};

export { describeConnectionTiles };
