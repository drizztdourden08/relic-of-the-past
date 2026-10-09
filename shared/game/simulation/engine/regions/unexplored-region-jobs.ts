/* @layer shared-game @kind logic */
import type { SimExit } from '../../types';
import type { RegionJob, RegionReachMap } from './regions.type';
import { arrivalAccountedFor } from './arrival-accounted-for';
import { arrivalKey } from './arrival-key';

const unexploredRegionJobs = (
  discovered: Map<string, SimExit[]>,
  map: RegionReachMap,
  visited: Set<string>,
  arrivals: Set<string>,
  crossings?: Set<string>,
): RegionJob[] => {
  const out: RegionJob[] = [];
  const seen = new Set<string>();
  for (const [from, exits] of discovered) {
    for (const exit of exits) {
      if (!visited.has(exit.to) || !exit.entryTile) continue;
      if (arrivalAccountedFor(arrivals, map, exit, crossings, from)) continue;
      const key = `${from}->${arrivalKey(exit.to, exit.edgeSig)}`;
      if (!seen.has(key)) { seen.add(key); out.push({ from, to: exit.to, edgeSig: exit.edgeSig }); }
    }
  }
  return out;
};

export { unexploredRegionJobs };
