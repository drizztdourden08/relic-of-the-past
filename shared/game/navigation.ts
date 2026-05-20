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

/** Screen ID pattern — physical overworld screens like lw-1b, dw-0a */
const SCREEN_PATTERN = /^(lw|dw)-[0-9a-f]{2}$/;

/**
 * Determines if a node is a "logical area" — an abstract hub that
 * doesn't represent a physical screen or interior.
 * These include: light-world, death-mountain, east-dark-world, pyramid-ledge, etc.
 */
function isLogicalArea(id: string): boolean {
  if (SCREEN_PATTERN.test(id)) return false;
  const region = REGION_BY_ID.get(id);
  if (!region) return false;
  return region.type === 'lightWorld' || region.type === 'darkWorld';
}

/**
 * Builds a precise adjacency list where logical area nodes are eliminated.
 * Edges through logical areas are replaced with direct edges between their
 * physical neighbors (screens and interiors), preventing hub shortcuts.
 *
 * Strategy: For each logical area L with neighbors A and B:
 *   - If A is a screen: add edge screen→interior for each interior B (entering)
 *   - If A is an interior: add edge interior→screen for each screen B (exiting)
 *   - Never create interior→interior shortcuts through L
 */
function buildPreciseAdjacencyList(connections: RegionConnection[]): AdjacencyList {
  // First build the full graph
  const fullAdj = buildAdjacencyList(connections);

  // Collect logical area nodes and their connections
  const logicalAreas = new Set<string>();
  for (const [id] of fullAdj) {
    if (isLogicalArea(id)) logicalAreas.add(id);
  }

  // Build new graph without logical areas
  const adj: AdjacencyList = new Map();

  // Copy all edges that don't involve logical areas
  for (const [node, edges] of fullAdj) {
    if (logicalAreas.has(node)) continue;
    const filtered: { to: string; entrance: string }[] = [];
    for (const edge of edges) {
      if (!logicalAreas.has(edge.to)) {
        filtered.push(edge);
      }
    }
    adj.set(node, filtered);
  }

  // For each logical area, bridge its neighbors:
  // screens ↔ interiors only (no interior→interior shortcuts)
  for (const areaId of logicalAreas) {
    const areaEdges = fullAdj.get(areaId) ?? [];
    // Find all nodes that have edges TO this logical area
    const incomingNodes: { from: string; entrance: string }[] = [];
    for (const [node, edges] of fullAdj) {
      if (logicalAreas.has(node)) continue;
      for (const edge of edges) {
        if (edge.to === areaId) {
          incomingNodes.push({ from: node, entrance: edge.entrance });
        }
      }
    }

    // Outgoing edges from the logical area (to non-logical-area nodes)
    const outgoingNodes = areaEdges.filter(e => !logicalAreas.has(e.to));

    // Create bridge edges: incoming → outgoing
    // But only screen→interior or interior→screen (no interior→interior)
    for (const incoming of incomingNodes) {
      for (const outgoing of outgoingNodes) {
        if (incoming.from === outgoing.to) continue;
        const fromIsScreen = SCREEN_PATTERN.test(incoming.from);
        const toIsScreen = SCREEN_PATTERN.test(outgoing.to);
        // Allow: screen→interior, interior→screen, screen→screen
        // Deny: interior→interior (that's the hub shortcut we want to prevent)
        if (!fromIsScreen && !toIsScreen) continue;

        let edges = adj.get(incoming.from);
        if (!edges) { edges = []; adj.set(incoming.from, edges); }
        edges.push({ to: outgoing.to, entrance: outgoing.entrance });
      }
    }
  }

  // Ensure all non-logical-area nodes exist in the map
  for (const [id] of REGION_BY_ID) {
    if (!logicalAreas.has(id) && !adj.has(id)) {
      adj.set(id, []);
    }
  }

  return adj;
}

/**
 * BFS shortest path through physical locations only — overworld screens
 * (lw-XX, dw-XX) and interiors (caves/dungeons/houses).
 * Logical area hubs are eliminated, forcing screen-by-screen routing.
 */
export function findPrecisePath(sourceId: string, targetId: string): NavigationResult {
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildPreciseAdjacencyList(allConnections);

  const totalNodes = adj.size;
  const totalEdges = allConnections.length;

  if (!adj.has(sourceId)) {
    return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };
  }
  if (!adj.has(targetId)) {
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

  // Standard BFS on the precise graph
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
