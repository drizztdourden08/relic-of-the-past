/* @layer shared-game @kind logic */
import type { SimObservation } from '../../types';
import type { EngineEnv } from '../engine.type';
import type { EngineState } from '../state/state.type';
import { reachableFrom } from '../traversal/reachable-from';
import { reachableDiscovered } from '../discovered-graph/reachable-discovered';
import { recordExits } from '../discovered-graph/record-exits';
import { markWayBackUsed } from '../regions/mark-way-back-used';
import { unexploredRegionJobs } from '../regions/unexplored-region-jobs';
import { inCompletedGroup } from '../dungeon-ledger-lifecycle/in-completed-group';
import { canPass } from './can-pass';

const refreshFrontier = (env: EngineEnv, s: EngineState, obs: SimObservation): void => {
  if (obs.exits) recordExits(s.discovered, s.virtual.screenId, obs.exits);
  if (obs.exits) markWayBackUsed(s.arrivals, s.cameFrom, obs.exits);
  const reachable = s.discovered.size > 0
    ? reachableDiscovered(s.discovered, s.virtual.screenId)
    : reachableFrom(env.adjacency, s.virtual.screenId, canPass(s));
  for (const id of reachable) s.reachedScreens.add(id);
  s.frontier = [...reachable].filter(id =>
    id !== s.virtual.screenId && !s.visited.has(id) && !inCompletedGroup(s, id));
  s.regionJobs = unexploredRegionJobs(s.discovered, s.regionReach, s).filter(j => j.to !== s.virtual.screenId);
};

export { refreshFrontier };
