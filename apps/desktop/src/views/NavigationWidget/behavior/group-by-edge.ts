/* @layer renderer-widgets @kind logic */
import type { BorderEdge, ConnectionInfo } from '@rotp/game-core';

const groupByEdge = (connections: readonly ConnectionInfo[]): Record<BorderEdge, ConnectionInfo[]> => {
  const byEdge: Record<BorderEdge, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of connections) byEdge[c.edge].push(c);
  return byEdge;
};

export { groupByEdge };
