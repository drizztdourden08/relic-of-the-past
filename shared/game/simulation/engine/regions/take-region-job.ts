/* @layer shared-game @kind logic */
import { findDiscoveredPath } from '../discovered-graph/find-discovered-path';
import type { EngineState } from '../state/state.type';

const takeRegionJob = (s: EngineState): string[] | null => {
  while (s.regionJobs.length > 0) {
    const job = s.regionJobs.shift()!;
    const path = findDiscoveredPath(s.discovered, s.virtual.screenId, job.from);
    if (path) {
      s.pendingEdgeSig = job.edgeSig ?? null;
      return [...path.slice(1), job.to];
    }
  }
  return null;
};

export { takeRegionJob };
