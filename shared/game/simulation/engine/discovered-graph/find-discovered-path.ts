/* @layer shared-game @kind logic */
import type { DiscoveredGraph } from './discovered-graph.type';

const unwindPath = (prev: Map<string, string>, from: string, to: string): string[] => {
  const path = [to];
  let node = to;
  while (node !== from) { node = prev.get(node)!; path.unshift(node); }
  return path;
};

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
      if (exit.to === to) return unwindPath(prev, from, to);
      queue.push(exit.to);
    }
  }
  return null;
};

export { findDiscoveredPath };
