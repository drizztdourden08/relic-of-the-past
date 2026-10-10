/* @layer shared-game @kind logic */
import type { DiscoveredGraph } from './discovered-graph.type';

const reachableDiscovered = (graph: DiscoveredGraph, from: string): Set<string> => {
  const reached = new Set<string>([from]);
  const queue: string[] = [from];
  for (let cur = queue.shift(); cur !== undefined; cur = queue.shift()) {
    for (const exit of graph.get(cur) ?? []) {
      if (reached.has(exit.to)) continue;
      reached.add(exit.to);
      queue.push(exit.to);
    }
  }
  return reached;
};

export { reachableDiscovered };
