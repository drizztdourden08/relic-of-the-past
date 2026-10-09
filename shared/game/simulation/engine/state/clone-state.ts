/* @layer shared-game @kind logic */
import type { EngineState } from './state.type';

const cloneState = (s: EngineState): EngineState => ({
  ...s,
  inventory: new Set(s.inventory),
  reachTokens: new Set(s.reachTokens),
  keys: new Map(s.keys),
  bigKeys: new Set(s.bigKeys),
  events: new Set(s.events),
  visited: new Set(s.visited),
  everVisited: new Set(s.everVisited),
  discovered: new Map(s.discovered),
  regionReach: new Map(s.regionReach),
  regionJobs: [...s.regionJobs],
  frontier: [...s.frontier],
  reachedScreens: new Set(s.reachedScreens),
  arrivals: new Set(s.arrivals),
  crossings: new Set(s.crossings),
  cameFrom: s.cameFrom,
  pendingEdgeSig: s.pendingEdgeSig,
  trapClosed: new Set(s.trapClosed),
  done: new Set(s.done),
  failed: new Set(s.failed),
  completedChecks: new Set(s.completedChecks),
  ledgers: new Map([...s.ledgers].map(([group, ledger]) => [
    group,
    { ...ledger, owed: ledger.owed.map(o => ({ ...o })), reopensOn: [...ledger.reopensOn] },
  ])),
  pending: [...s.pending],
  route: [...s.route],
});

export { cloneState };
