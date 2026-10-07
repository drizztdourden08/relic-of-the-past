/* @layer renderer-widgets @kind logic */
/**
 * Resolves WHERE a connection crosses, for the connection editor. Prefers a
 * connection's persisted `nav` (overlap tiles or entry point) and falls back to
 * the live flood's matching ConnectionInfo when the connection has no nav yet.
 *
 * Also exposes the flood-matcher the add path uses to attach derived nav.
 */

import type { ConnectionInfo } from '@shared/game/navigation';
import type { ConnectionNavData } from '@shared/game/navigation';
import { resolveRealDestId } from './connection-audit-resolve';

// A flood crossing backs a connection when its target index resolves to the
// connection's `to` id. targetScreen can be an overworld screen index (outdoors)
// or a room index (indoors), so try both resolutions.
const findFloodForTarget = (floodConnections: ConnectionInfo[], toId: string): ConnectionInfo | undefined => {
  return floodConnections.find(info =>
    resolveRealDestId('screen', info.targetScreen) === toId
    || resolveRealDestId('room', info.targetScreen) === toId);
};

// The flood always runs from the current screen, so only edges leaving it can
// be backed by a live crossing.
const matchFlood = (
  conn: { from: string; to: string },
  floodConnections: ConnectionInfo[],
  screenId: string | null,
): ConnectionInfo | undefined => {
  if (!screenId || conn.from !== screenId) return undefined;
  return findFloodForTarget(floodConnections, conn.to);
};

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

// Compact, read-only crossing description for one connection: persisted nav
// first, then the live flood fallback, else null (nothing to show).
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

export { findFloodForTarget, matchFlood, describeConnectionTiles };
