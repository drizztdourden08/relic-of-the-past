import type { RegionConnection, RegionDefinition } from '../types';
import type { NavigationStep, NavigationResult, PathfindingOptions } from './types';
import { ALL_CONNECTIONS, DUNGEON_CONNECTIONS } from '../data/connections';
import { REGION_BY_ID } from '../data/regions';

type AdjacencyList = Map<string, { to: string; entrance: string }[]>;

// ─── Memoized Graph Instances ────────────────────────────────────────────────

let cachedFullAdj: AdjacencyList | null = null;
let cachedPreciseAdj: AdjacencyList | null = null;

function getFullAdjacencyList(options: PathfindingOptions = {}): AdjacencyList {
  if (!options.allowGlitches && cachedFullAdj) return cachedFullAdj;
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildAdjacencyList(allConnections, options);
  if (!options.allowGlitches) cachedFullAdj = adj;
  return adj;
}

function getPreciseAdjacencyList(options: PathfindingOptions = {}): AdjacencyList {
  if (!options.allowGlitches && cachedPreciseAdj) return cachedPreciseAdj;
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildPreciseAdjacencyList(allConnections, options);
  if (!options.allowGlitches) cachedPreciseAdj = adj;
  return adj;
}

// ─── Graph Construction ──────────────────────────────────────────────────────

function buildAdjacencyList(connections: RegionConnection[], options: PathfindingOptions = {}): AdjacencyList {
  const { allowGlitches = false } = options;
  const adj: AdjacencyList = new Map();

  for (const conn of connections) {
    if (!allowGlitches && conn.tags.includes('barrier:glitch')) continue;

    let edges = adj.get(conn.from);
    if (!edges) { edges = []; adj.set(conn.from, edges); }
    edges.push({ to: conn.to, entrance: conn.entrance });

    if (conn.tags.includes('dir:two-way')) {
      let reverseEdges = adj.get(conn.to);
      if (!reverseEdges) { reverseEdges = []; adj.set(conn.to, reverseEdges); }
      reverseEdges.push({ to: conn.from, entrance: `${conn.entrance} (return)` });
    }

    if (!adj.has(conn.to)) adj.set(conn.to, []);
  }

  return adj;
}

// ─── Logical Area Filtering ──────────────────────────────────────────────────

const SCREEN_PATTERN = /^(lw|dw)-[0-9a-f]{2}$/;

function isLogicalArea(id: string): boolean {
  if (SCREEN_PATTERN.test(id)) return false;
  const region = REGION_BY_ID.get(id);
  if (!region) return false;
  return region.type === 'lightWorld' || region.type === 'darkWorld';
}

/**
 * Build adjacency list with logical area hubs eliminated.
 * Bridges physical neighbors directly (screen↔interior only).
 */
function buildPreciseAdjacencyList(connections: RegionConnection[], options: PathfindingOptions = {}): AdjacencyList {
  const fullAdj = buildAdjacencyList(connections, options);
  const logicalAreas = new Set<string>();
  for (const [id] of fullAdj) {
    if (isLogicalArea(id)) logicalAreas.add(id);
  }

  const adj: AdjacencyList = new Map();

  for (const [node, edges] of fullAdj) {
    if (logicalAreas.has(node)) continue;
    adj.set(node, edges.filter(e => !logicalAreas.has(e.to)));
  }

  for (const areaId of logicalAreas) {
    const areaEdges = fullAdj.get(areaId) ?? [];
    const incomingNodes: { from: string; entrance: string }[] = [];
    for (const [node, edges] of fullAdj) {
      if (logicalAreas.has(node)) continue;
      for (const edge of edges) {
        if (edge.to === areaId) incomingNodes.push({ from: node, entrance: edge.entrance });
      }
    }

    const outgoingNodes = areaEdges.filter(e => !logicalAreas.has(e.to));

    for (const incoming of incomingNodes) {
      for (const outgoing of outgoingNodes) {
        if (incoming.from === outgoing.to) continue;
        const fromIsScreen = SCREEN_PATTERN.test(incoming.from);
        const toIsScreen = SCREEN_PATTERN.test(outgoing.to);
        if (!fromIsScreen && !toIsScreen) continue;

        let edges = adj.get(incoming.from);
        if (!edges) { edges = []; adj.set(incoming.from, edges); }
        edges.push({ to: outgoing.to, entrance: outgoing.entrance });
      }
    }
  }

  for (const [id] of REGION_BY_ID) {
    if (!logicalAreas.has(id) && !adj.has(id)) adj.set(id, []);
  }

  return adj;
}

// ─── BFS Pathfinding ─────────────────────────────────────────────────────────

function bfsPath(adj: AdjacencyList, sourceId: string, targetId: string): NavigationResult {
  const totalNodes = adj.size;
  const totalEdges = [...adj.values()].reduce((s, e) => s + e.length, 0);

  if (!adj.has(sourceId)) return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };
  if (!adj.has(targetId)) return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };

  if (sourceId === targetId) {
    const region = REGION_BY_ID.get(sourceId);
    return { found: true, path: [{ regionId: sourceId, regionName: region?.name ?? sourceId, entrance: null }], distance: 0, visited: 1, totalNodes, totalEdges };
  }

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
        return { found: true, path, distance: path.length - 1, visited: visited.size, totalNodes, totalEdges };
      }

      queue.push(to);
    }
  }

  return { found: false, path: [], distance: -1, visited: visited.size, totalNodes, totalEdges };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Hub-level BFS shortest path (allows logical area shortcuts).
 * Entry point #4: region-graph navigation.
 */
export function findShortestPath(sourceId: string, targetId: string, options: PathfindingOptions = {}): NavigationResult {
  const adj = getFullAdjacencyList(options);
  return bfsPath(adj, sourceId, targetId);
}

/**
 * Precise BFS shortest path through physical locations only.
 * Logical area hubs are eliminated, forcing screen-by-screen routing.
 */
export function findPrecisePath(sourceId: string, targetId: string, options: PathfindingOptions = {}): NavigationResult {
  const adj = getPreciseAdjacencyList(options);
  return bfsPath(adj, sourceId, targetId);
}

/** Find all regions unreachable from source (disconnected nodes). */
export function findUnreachableRegions(sourceId: string = 'menu'): { id: string; name: string; type: string }[] {
  const adj = getFullAdjacencyList();

  const visited = new Set<string>();
  const queue: string[] = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current);
    if (!edges) continue;
    for (const { to } of edges) {
      if (!visited.has(to)) { visited.add(to); queue.push(to); }
    }
  }

  const unreachable: { id: string; name: string; type: string }[] = [];
  for (const [id, region] of REGION_BY_ID) {
    if (!visited.has(id)) unreachable.push({ id, name: region.name, type: region.type });
  }
  return unreachable;
}

/** Get graph statistics for debugging. */
export function getGraphStats() {
  const adj = getFullAdjacencyList();
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];

  const deadEnds: string[] = [];
  const incomingCount = new Map<string, number>();

  for (const [node, edges] of adj) {
    if (edges.length === 0) deadEnds.push(node);
    for (const { to } of edges) {
      incomingCount.set(to, (incomingCount.get(to) ?? 0) + 1);
    }
  }

  const entryOnly: string[] = [];
  for (const [node] of adj) {
    if (!incomingCount.has(node) || incomingCount.get(node) === 0) entryOnly.push(node);
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
