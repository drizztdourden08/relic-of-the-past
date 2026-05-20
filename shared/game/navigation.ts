import type { RegionConnection, RegionDefinition } from './types';
import { ALL_CONNECTIONS, DUNGEON_CONNECTIONS } from './connections';
import { REGION_BY_ID } from './regions';

export interface NavigationStep {
  regionId: string;
  regionName: string;
  entrance: string | null; // null for the starting node
}

export interface NavigationResult {
  found: boolean;
  path: NavigationStep[];
  distance: number;
  /** Regions visited during search (for debugging data coverage) */
  visited: number;
  /** Total regions in graph */
  totalNodes: number;
  /** Total edges in graph */
  totalEdges: number;
}

type AdjacencyList = Map<string, { to: string; entrance: string }[]>;

function buildAdjacencyList(connections: RegionConnection[]): AdjacencyList {
  const adj: AdjacencyList = new Map();

  for (const conn of connections) {
    // Forward edge: from → to
    let edges = adj.get(conn.from);
    if (!edges) {
      edges = [];
      adj.set(conn.from, edges);
    }
    edges.push({ to: conn.to, entrance: conn.entrance });

    // Reverse edge for two-way connections: to → from
    if (conn.tags.includes('dir:two-way')) {
      let reverseEdges = adj.get(conn.to);
      if (!reverseEdges) {
        reverseEdges = [];
        adj.set(conn.to, reverseEdges);
      }
      reverseEdges.push({ to: conn.from, entrance: `${conn.entrance} (return)` });
    }

    // Ensure destination node exists in the map even if it has no outgoing edges
    if (!adj.has(conn.to)) {
      adj.set(conn.to, []);
    }
  }

  return adj;
}

/**
 * BFS shortest-path from source to target, ignoring all logic/barrier requirements.
 * Returns the full path with region names and entrance labels.
 */
export function findShortestPath(sourceId: string, targetId: string): NavigationResult {
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildAdjacencyList(allConnections);

  const totalNodes = adj.size;
  const totalEdges = allConnections.length;

  if (!adj.has(sourceId) && !REGION_BY_ID.has(sourceId)) {
    return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };
  }
  if (!adj.has(targetId) && !REGION_BY_ID.has(targetId)) {
    return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };
  }

  if (sourceId === targetId) {
    const region = REGION_BY_ID.get(sourceId);
    return {
      found: true,
      path: [{ regionId: sourceId, regionName: region?.name ?? sourceId, entrance: null }],
      distance: 0,
      visited: 1,
      totalNodes,
      totalEdges,
    };
  }

  // BFS
  const visited = new Set<string>();
  const parent = new Map<string, { from: string; entrance: string }>();
  const queue: string[] = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    const edges = adj.get(current);
    if (!edges) continue;

    for (const { to, entrance } of edges) {
      if (visited.has(to)) continue;
      visited.add(to);
      parent.set(to, { from: current, entrance });

      if (to === targetId) {
        // Reconstruct path
        const path: NavigationStep[] = [];
        let node = targetId;
        while (node !== sourceId) {
          const p = parent.get(node)!;
          const region = REGION_BY_ID.get(node);
          path.unshift({ regionId: node, regionName: region?.name ?? node, entrance: p.entrance });
          node = p.from;
        }
        const sourceRegion = REGION_BY_ID.get(sourceId);
        path.unshift({ regionId: sourceId, regionName: sourceRegion?.name ?? sourceId, entrance: null });

        return {
          found: true,
          path,
          distance: path.length - 1,
          visited: visited.size,
          totalNodes,
          totalEdges,
        };
      }

      queue.push(to);
    }
  }

  return { found: false, path: [], distance: -1, visited: visited.size, totalNodes, totalEdges };
}

/**
 * Find all regions that are unreachable from the given source (disconnected nodes).
 * Useful for finding data gaps in connection graph.
 */
export function findUnreachableRegions(sourceId: string = 'menu'): { id: string; name: string; type: string }[] {
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildAdjacencyList(allConnections);

  // BFS from source
  const visited = new Set<string>();
  const queue: string[] = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current);
    if (!edges) continue;
    for (const { to } of edges) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
      }
    }
  }

  // Compare against all known regions
  const unreachable: { id: string; name: string; type: string }[] = [];
  for (const [id, region] of REGION_BY_ID) {
    if (!visited.has(id)) {
      unreachable.push({ id, name: region.name, type: region.type });
    }
  }

  return unreachable;
}

/**
 * Get graph statistics for debugging.
 */
export function getGraphStats() {
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildAdjacencyList(allConnections);

  // Count nodes with no outgoing edges (dead ends)
  const deadEnds: string[] = [];
  // Count nodes with no incoming edges (entry-only points)
  const incomingCount = new Map<string, number>();

  for (const [node, edges] of adj) {
    if (edges.length === 0) deadEnds.push(node);
    for (const { to } of edges) {
      incomingCount.set(to, (incomingCount.get(to) ?? 0) + 1);
    }
  }

  const entryOnly: string[] = [];
  for (const [node] of adj) {
    if (!incomingCount.has(node) || incomingCount.get(node) === 0) {
      entryOnly.push(node);
    }
  }

  return {
    totalRegions: REGION_BY_ID.size,
    totalNodesInGraph: adj.size,
    totalConnections: allConnections.length,
    deadEnds,
    entryOnlyNodes: entryOnly,
    orphanedRegions: [...REGION_BY_ID.keys()].filter(id => !adj.has(id)),
  };
}
