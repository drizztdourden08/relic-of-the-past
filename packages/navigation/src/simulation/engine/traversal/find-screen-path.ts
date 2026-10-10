/* @layer shared-game @kind logic */
import type { PathLinks, PathQuery, ScreenEdge, ScreenPathResult } from './traversal.type';

const rebuildPath = (prev: PathLinks, from: string, to: string): ScreenPathResult => {
  const path: string[] = [to];
  const edges: ScreenEdge[] = [];
  let cur = to;
  while (cur !== from) {
    const link = prev.get(cur);
    if (link === undefined) throw new Error(`No screen link back from ${cur}`);
    edges.unshift(link.edge);
    path.unshift(link.via);
    cur = link.via;
  }
  return { path, edges };
};

const findScreenPath = ({ adjacency, from, to, canPass }: PathQuery): ScreenPathResult | null => {
  if (from === to) return { path: [from], edges: [] };
  const prev: PathLinks = new Map();
  const queue: string[] = [from];
  const seen = new Set<string>([from]);

  for (let cur = queue.shift(); cur !== undefined; cur = queue.shift()) {
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

export { findScreenPath };
