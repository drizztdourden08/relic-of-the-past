/* @layer shared-game @kind logic */
import type { Adjacency, CanPass } from './traversal.type';

const reachableFrom = (adjacency: Adjacency, from: string, canPass: CanPass): Set<string> => {
  const reached = new Set<string>([from]);
  const queue: string[] = [from];
  for (let cur = queue.shift(); cur !== undefined; cur = queue.shift()) {
    for (const edge of adjacency.get(cur) ?? []) {
      if (reached.has(edge.to) || !canPass(edge)) continue;
      reached.add(edge.to);
      queue.push(edge.to);
    }
  }
  return reached;
};

export { reachableFrom };
