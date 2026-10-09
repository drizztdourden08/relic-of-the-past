/* @layer shared-game @kind logic */
import { find } from '@rotp/game-data';
import { toScreenIdOf } from '@rotp/game-data';
import type { ConnectionRecord } from '@rotp/game-data';
import type { Adjacency, ScreenEdge } from './traversal.type';
import { connectionRequirements } from './connection-requirements';

const addEdge = (adj: Adjacency, from: string, edge: ScreenEdge): void => {
  const list = adj.get(from);
  if (list) list.push(edge);
  else adj.set(from, [edge]);
};

const buildAdjacency = (connections: ConnectionRecord[] = find('connection', () => true)): Adjacency => {
  const adj: Adjacency = new Map();
  for (const conn of connections) {
    if (!conn.canExit) continue;
    const requirements = connectionRequirements(conn);
    addEdge(adj, conn.screenId, { to: toScreenIdOf(conn), requirements, connection: conn });
  }
  return adj;
};

export { buildAdjacency };
