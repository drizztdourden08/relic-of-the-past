/* @layer shared-game @kind logic */
import type { SimExit } from '../../types';
import type { DiscoveredGraph } from './discovered-graph.type';
import { owWorldOf } from './ow-world-of';

const crossesWorlds = (from: string, to: string): boolean => {
  const a = owWorldOf(from);
  const b = owWorldOf(to);
  return a !== undefined && b !== undefined && a !== b;
};

const recordExits = (graph: DiscoveredGraph, from: string, exits: SimExit[]): void => {
  const kept = exits.filter((e) => !crossesWorlds(from, e.to));
  const merged = [...kept];
  for (const prev of graph.get(from) ?? []) {
    if (!merged.some((e) => e.to === prev.to)) merged.push(prev);
  }
  graph.set(from, merged);
  for (const exit of kept) {
    if (!exit.twoWay) continue;
    const back = graph.get(exit.to) ?? [];
    if (!back.some((e) => e.to === from)) {
      back.push({ to: from });
      graph.set(exit.to, back);
    }
  }
};

export { recordExits };
