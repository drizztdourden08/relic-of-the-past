/* @layer shared-game @kind logic */
import type { ScreenConnection, ScreenDefinition } from '../types';
import type { NavigationStep, NavigationResult, PathfindingOptions } from './types';
import { ALL_CONNECTIONS, DUNGEON_CONNECTIONS } from '../data/connections';
import { SCREEN_BY_ID } from '../data/screens';

type AdjacencyList = Map<string, string[]>;

// ─── Memoized Graph Instances ────────────────────────────────────────────────

let cachedFullAdj: AdjacencyList | null = null;
let cachedPreciseAdj: AdjacencyList | null = null;

const getFullAdjacencyList = (options: PathfindingOptions = {}): AdjacencyList => {
  if (!options.allowGlitches && cachedFullAdj) return cachedFullAdj;
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildAdjacencyList(allConnections, options);
  if (!options.allowGlitches) cachedFullAdj = adj;
  return adj;
};

const getPreciseAdjacencyList = (options: PathfindingOptions = {}): AdjacencyList => {
  if (!options.allowGlitches && cachedPreciseAdj) return cachedPreciseAdj;
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];
  const adj = buildPreciseAdjacencyList(allConnections, options);
  if (!options.allowGlitches) cachedPreciseAdj = adj;
  return adj;
};

// ─── Graph Construction ──────────────────────────────────────────────────────

const buildAdjacencyList = (connections: ScreenConnection[], options: PathfindingOptions = {}): AdjacencyList => {
  const { allowGlitches = false } = options;
  const adj: AdjacencyList = new Map();

  for (const conn of connections) {
    if (!allowGlitches && conn.tags.includes('barrier:glitch')) continue;

    let edges = adj.get(conn.from);
    if (!edges) { edges = []; adj.set(conn.from, edges); }
    edges.push(conn.to);

    if (conn.tags.includes('dir:two-way')) {
      let reverseEdges = adj.get(conn.to);
      if (!reverseEdges) { reverseEdges = []; adj.set(conn.to, reverseEdges); }
      reverseEdges.push(conn.from);
    }

    if (!adj.has(conn.to)) adj.set(conn.to, []);
  }

  return adj;
};

// ─── Logical Area Filtering ──────────────────────────────────────────────────

const SCREEN_PATTERN = /^(lw|dw)-[0-9a-f]{2}$/;

const isLogicalArea = (id: string): boolean => {
  if (SCREEN_PATTERN.test(id)) return false;
  const screen = SCREEN_BY_ID.get(id);
  if (!screen) return false;
  return screen.type === 'overworld';
};

const buildPreciseAdjacencyList = (connections: ScreenConnection[], options: PathfindingOptions = {}): AdjacencyList => {
  const fullAdj = buildAdjacencyList(connections, options);
  const logicalAreas = new Set<string>();
  for (const [id] of fullAdj) {
    if (isLogicalArea(id)) logicalAreas.add(id);
  }

  const adj: AdjacencyList = new Map();

  for (const [node, edges] of fullAdj) {
    if (logicalAreas.has(node)) continue;
    adj.set(node, edges.filter(to => !logicalAreas.has(to)));
  }

  for (const areaId of logicalAreas) {
    const areaEdges = fullAdj.get(areaId) ?? [];
    const incomingNodes: string[] = [];
    for (const [node, edges] of fullAdj) {
      if (logicalAreas.has(node)) continue;
      for (const to of edges) {
        if (to === areaId) incomingNodes.push(node);
      }
    }

    const outgoingNodes = areaEdges.filter(to => !logicalAreas.has(to));

    for (const incomingFrom of incomingNodes) {
      for (const outgoingTo of outgoingNodes) {
        if (incomingFrom === outgoingTo) continue;
        const fromIsScreen = SCREEN_PATTERN.test(incomingFrom);
        const toIsScreen = SCREEN_PATTERN.test(outgoingTo);
        if (!fromIsScreen && !toIsScreen) continue;

        let edges = adj.get(incomingFrom);
        if (!edges) { edges = []; adj.set(incomingFrom, edges); }
        edges.push(outgoingTo);
      }
    }
  }

  for (const [id] of SCREEN_BY_ID) {
    if (!logicalAreas.has(id) && !adj.has(id)) adj.set(id, []);
  }

  return adj;
};

// ─── BFS Pathfinding ─────────────────────────────────────────────────────────

const bfsPath = (adj: AdjacencyList, sourceId: string, targetId: string): NavigationResult => {
  const totalNodes = adj.size;
  const totalEdges = [...adj.values()].reduce((s, e) => s + e.length, 0);

  if (!adj.has(sourceId)) return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };
  if (!adj.has(targetId)) return { found: false, path: [], distance: -1, visited: 0, totalNodes, totalEdges };

  if (sourceId === targetId) {
    const screen = SCREEN_BY_ID.get(sourceId);
    return { found: true, path: [{ screenId: sourceId, screenName: screen?.name ?? sourceId }], distance: 0, visited: 1, totalNodes, totalEdges };
  }

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: string[] = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current);
    if (!edges) continue;

    for (const to of edges) {
      if (visited.has(to)) continue;
      visited.add(to);
      parent.set(to, current);

      if (to === targetId) {
        const path: NavigationStep[] = [];
        let node = targetId;
        while (node !== sourceId) {
          const screen = SCREEN_BY_ID.get(node);
          path.unshift({ screenId: node, screenName: screen?.name ?? node });
          node = parent.get(node)!;
        }
        const sourceScreen = SCREEN_BY_ID.get(sourceId);
        path.unshift({ screenId: sourceId, screenName: sourceScreen?.name ?? sourceId });
        return { found: true, path, distance: path.length - 1, visited: visited.size, totalNodes, totalEdges };
      }

      queue.push(to);
    }
  }

  return { found: false, path: [], distance: -1, visited: visited.size, totalNodes, totalEdges };
};

// ─── Public API ──────────────────────────────────────────────────────────────

const findShortestPath = (sourceId: string, targetId: string, options: PathfindingOptions = {}): NavigationResult => {
  const adj = getFullAdjacencyList(options);
  return bfsPath(adj, sourceId, targetId);
};

const findPrecisePath = (sourceId: string, targetId: string, options: PathfindingOptions = {}): NavigationResult => {
  const adj = getPreciseAdjacencyList(options);
  return bfsPath(adj, sourceId, targetId);
};

const findUnreachableScreens = (sourceId: string = 'menu'): { id: string; name: string; type: string }[] => {
  const adj = getFullAdjacencyList();

  const visited = new Set<string>();
  const queue: string[] = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current);
    if (!edges) continue;
    for (const to of edges) {
      if (!visited.has(to)) { visited.add(to); queue.push(to); }
    }
  }

  const unreachable: { id: string; name: string; type: string }[] = [];
  for (const [id, screen] of SCREEN_BY_ID) {
    if (!visited.has(id)) unreachable.push({ id, name: screen.name, type: screen.type });
  }
  return unreachable;
};

const getGraphStats = () => {
  const adj = getFullAdjacencyList();
  const allConnections = [...ALL_CONNECTIONS, ...DUNGEON_CONNECTIONS];

  const deadEnds: string[] = [];
  const incomingCount = new Map<string, number>();

  for (const [node, edges] of adj) {
    if (edges.length === 0) deadEnds.push(node);
    for (const to of edges) {
      incomingCount.set(to, (incomingCount.get(to) ?? 0) + 1);
    }
  }

  const entryOnly: string[] = [];
  for (const [node] of adj) {
    if (!incomingCount.has(node) || incomingCount.get(node) === 0) entryOnly.push(node);
  }

  return {
    totalScreens: SCREEN_BY_ID.size,
    totalNodesInGraph: adj.size,
    totalConnections: allConnections.length,
    deadEnds,
    entryOnlyNodes: entryOnly,
    orphanedScreens: [...SCREEN_BY_ID.keys()].filter(id => !adj.has(id)),
  };
};

export { findShortestPath, findPrecisePath, findUnreachableScreens, getGraphStats };
