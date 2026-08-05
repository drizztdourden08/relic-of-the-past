/* @layer shared-game @kind logic */
/**
 * Screen-level traversal over the static screen graph (all screens /
 * connections from the data facade). No tile walking — a route is a sequence
 * of screen IDs. Connection requirements gate every edge: `ConnectionNavData.requirements`
 * when present, else a fallback derived from `barrier:*` tags.
 */
import { connectionTagKeysOf, find, getScreen, hasTagKey } from '../../data';
import { toScreenIdOf } from '../../data/connections/derive';
import type { ConnectionRecord } from '../../data';
import type { RequirementSet } from '../../navigation/nav-data.types';
import type { Route, RouteStep, ScreenPath } from '../../navigation/types';
import { barrierTagsToRequirements } from '../requirements-map';

interface ScreenEdge {
  to: string;
  requirements: RequirementSet;
  connection: ConnectionRecord;
}

type Adjacency = Map<string, ScreenEdge[]>;

/**
 * A light↔dark crossing, detected two ways: explicitly via the cross-world /
 * warp tags, and structurally by comparing the endpoints' `world` fields —
 * some crossings in the dataset carry no cross-world marker (e.g. the
 * Superbunny Cave doors joining light-world East Death Mountain screens to a
 * dark-world interior). Endpoints missing from the registry count as
 * same-world, so unknown screens never gain a false gate.
 */
const isCrossWorld = (conn: ConnectionRecord): boolean => {
  if (hasTagKey(conn.tags, 'ctx:cross-world') || hasTagKey(conn.tags, 'transit:warp')) return true;
  const fromWorld = getScreen(conn.screenId).world;
  const toWorld = getScreen(toScreenIdOf(conn)).world;
  return fromWorld !== toWorld;
};

const connectionRequirements = (conn: ConnectionRecord): RequirementSet => {
  if (conn.nav?.requirements) return conn.nav.requirements;
  const fromBarriers = barrierTagsToRequirements(connectionTagKeysOf(conn.tags));
  if (fromBarriers.length > 0) return fromBarriers;
  // Fallback for a cross-world portal with no explicit nav data: traversing the
  // Dark World as the player needs the Moon Pearl, so gate on it at minimum. Without
  // this the rain-intro empty-inventory run warped lw-10 → west-dark-world and
  // swept the whole dark world. Conservative placeholder — the connections
  // dataset pass will replace it with the real requirement set.
  if (isCrossWorld(conn)) return [['moonpearl']];
  return [];
};

const addEdge = (adj: Adjacency, from: string, edge: ScreenEdge): void => {
  const list = adj.get(from);
  if (list) list.push(edge);
  else adj.set(from, [edge]);
};

/**
 * One `addEdge` per record now: a `ConnectionRecord` is one point on one
 * screen, and `canExit` says outright whether the player can leave THROUGH
 * it — no more synthesizing a reverse edge from a tag/field/nav trio that
 * could (and did) disagree. A two-way crossing still gets two edges, because
 * both of its paired records carry `canExit: true` and each contributes its
 * own; a `drop`'s `canExit: false` correctly contributes none.
 */
const buildAdjacency = (connections: ConnectionRecord[] = find('connection', () => true)): Adjacency => {
  const adj: Adjacency = new Map();
  for (const conn of connections) {
    if (!conn.canExit) continue;
    const requirements = connectionRequirements(conn);
    addEdge(adj, conn.screenId, { to: toScreenIdOf(conn), requirements, connection: conn });
  }
  return adj;
};

/** Predicate telling whether an edge's requirements are currently satisfied. */
type CanPass = (edge: ScreenEdge) => boolean;

interface PathQuery {
  adjacency: Adjacency;
  from: string;
  to: string;
  canPass: CanPass;
}

/** BFS shortest screen path (by hop count). Returns the crossed edges too. */
const findScreenPath = ({ adjacency, from, to, canPass }: PathQuery): { path: string[]; edges: ScreenEdge[] } | null => {
  if (from === to) return { path: [from], edges: [] };
  const prev = new Map<string, { via: string; edge: ScreenEdge }>();
  const queue: string[] = [from];
  const seen = new Set<string>([from]);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const edge of adjacency.get(cur) ?? []) {
      if (seen.has(edge.to) || !canPass(edge)) continue;
      seen.add(edge.to);
      prev.set(edge.to, { via: cur, edge });
      if (edge.to === to) return rebuildPath(prev, from, to);
      queue.push(edge.to);
    }
  }
  return null;
};

const rebuildPath = (
  prev: Map<string, { via: string; edge: ScreenEdge }>,
  from: string,
  to: string,
): { path: string[]; edges: ScreenEdge[] } => {
  const path: string[] = [to];
  const edges: ScreenEdge[] = [];
  let cur = to;
  while (cur !== from) {
    const link = prev.get(cur)!;
    edges.unshift(link.edge);
    path.unshift(link.via);
    cur = link.via;
  }
  return { path, edges };
};

/** All screen IDs reachable from a start, honouring the canPass predicate. */
const reachableFrom = (adjacency: Adjacency, from: string, canPass: CanPass): Set<string> => {
  const reached = new Set<string>([from]);
  const queue: string[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const edge of adjacency.get(cur) ?? []) {
      if (reached.has(edge.to) || !canPass(edge)) continue;
      reached.add(edge.to);
      queue.push(edge.to);
    }
  }
  return reached;
};

/** Adapt a screen-ID path into the navigation `Route` stub (no tile paths). */
const toRoute = (path: string[]): Route => {
  const steps: RouteStep[] = path.map(id => ({
    screen: getScreen(id).gameId.roomIndex ?? getScreen(id).gameId.overworldIndex ?? -1,
    path: [],
  }));
  return { steps, totalCost: Math.max(0, path.length - 1), screens: steps.map(s => s.screen), requirements: [] };
};

/** Adapt a screen-ID path into the navigation `ScreenPath` stub. */
const toScreenPath = (path: string[]): ScreenPath => ({
  screens: path.map(id => getScreen(id).gameId.roomIndex ?? getScreen(id).gameId.overworldIndex ?? -1),
  crossings: [],
  totalCost: Math.max(0, path.length - 1),
});

export {
  buildAdjacency,
  connectionRequirements,
  findScreenPath,
  reachableFrom,
  toRoute,
  toScreenPath,
};
export type { Adjacency, ScreenEdge, CanPass };
