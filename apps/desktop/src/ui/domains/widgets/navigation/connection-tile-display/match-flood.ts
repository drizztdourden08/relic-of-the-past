/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { findFloodForTarget } from './find-flood-for-target';

const matchFlood = (
  conn: { from: string; to: string },
  floodConnections: ConnectionInfo[],
  screenId: string | null,
): ConnectionInfo | undefined => {
  if (!screenId || conn.from !== screenId) return undefined;
  return findFloodForTarget(floodConnections, conn.to);
};

export { matchFlood };
