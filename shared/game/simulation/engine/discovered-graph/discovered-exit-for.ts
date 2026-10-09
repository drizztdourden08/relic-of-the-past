/* @layer shared-game @kind logic */
import type { SimExit } from '../../types';
import type { DiscoveredGraph } from './discovered-graph.type';

const discoveredExitFor = (graph: DiscoveredGraph, from: string, to: string, wantSig?: string | null): SimExit | undefined => {
  const list = graph.get(from) ?? [];
  if (wantSig) {
    const pinned = list.find((e) => e.to === to && e.edgeSig === wantSig);
    if (pinned) return pinned;
  }
  return list.find((e) => e.to === to);
};

export { discoveredExitFor };
