/* @layer shared-game @kind logic */
/**
 * The game-driven traversal graph: revealed screen by screen, each visited
 * screen's flood contributing the exits it actually detected (border
 * connections, doors, holes, stairs). No requirement gating — the flood already
 * ran with the current inventory, so every recorded edge is passable right now.
 */
import type { SimExit } from '../types';

type DiscoveredGraph = Map<string, SimExit[]>;

/** All screen IDs reachable from `from` over the discovered graph (BFS). */
const reachableDiscovered = (graph: DiscoveredGraph, from: string): Set<string> => {
  const reached = new Set<string>([from]);
  const queue: string[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const exit of graph.get(cur) ?? []) {
      if (reached.has(exit.to)) continue;
      reached.add(exit.to);
      queue.push(exit.to);
    }
  }
  return reached;
};

/** BFS shortest screen-id path over the discovered graph, or null. */
const findDiscoveredPath = (graph: DiscoveredGraph, from: string, to: string): string[] | null => {
  if (from === to) return [from];
  const prev = new Map<string, string>();
  const queue: string[] = [from];
  const seen = new Set<string>([from]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const exit of graph.get(cur) ?? []) {
      if (seen.has(exit.to)) continue;
      seen.add(exit.to);
      prev.set(exit.to, cur);
      if (exit.to === to) {
        const path = [to];
        let node = to;
        while (node !== from) { node = prev.get(node)!; path.unshift(node); }
        return path;
      }
      queue.push(exit.to);
    }
  }
  return null;
};

/** The exit record for a `from → to` hop (carries the landing tile). */
const discoveredExitFor = (graph: DiscoveredGraph, from: string, to: string): SimExit | undefined =>
  (graph.get(from) ?? []).find((e) => e.to === to);

/**
 * Record a screen's flood-detected exits. Keeps previously-known edges the new
 * flood didn't re-detect (synthetic reverse edges), and mirrors every two-way
 * border crossing as a reverse edge — so a dead-end room you walked into never
 * strands the BFS: the way you came in stays walkable back out.
 */
const recordExits = (graph: DiscoveredGraph, from: string, exits: SimExit[]): void => {
  const merged = [...exits];
  for (const prev of graph.get(from) ?? []) {
    if (!merged.some((e) => e.to === prev.to)) merged.push(prev);
  }
  graph.set(from, merged);
  for (const exit of exits) {
    if (!exit.twoWay) continue;
    const back = graph.get(exit.to) ?? [];
    if (!back.some((e) => e.to === from)) {
      back.push({ to: from });
      graph.set(exit.to, back);
    }
  }
};

export { reachableDiscovered, findDiscoveredPath, discoveredExitFor, recordExits };
export type { DiscoveredGraph };
