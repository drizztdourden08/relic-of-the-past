/* @layer shared-game @kind logic */
import type { TraversalRequirement } from '@rotp/game-data';
import type { SoftlockReport } from '../types';
import { find } from '@rotp/game-data';
import type { Adjacency } from './traversal/traversal.type';
import { buildAdjacency } from './traversal/build-adjacency';
import type { EngineState } from './state/state.type';
import type { ReportDeps } from './softlock-report.type';

const gatesInto = (adjacency: Adjacency, screenId: string): TraversalRequirement[][] => {
  const missing: TraversalRequirement[][] = [];
  for (const edges of adjacency.values()) {
    for (const edge of edges) {
      if (edge.to === screenId) missing.push(...edge.requirements);
    }
  }
  return missing;
};

const buildSoftlockReport = (state: EngineState, deps: ReportDeps = {}): SoftlockReport => {
  const adjacency = deps.adjacency ?? buildAdjacency();
  const checks = deps.checks ?? find('check', () => true);
  const screens = deps.screens ?? find('screen', () => true);

  const completed = [...state.completedChecks];
  const blocked = checks
    .filter(c => !state.completedChecks.has(c.id) && (!c.screenId || !state.reachedScreens.has(c.screenId)))
    .map(c => ({ checkId: c.id, missing: c.screenId ? gatesInto(adjacency, c.screenId) : [] }));
  const unreachedScreens = screens.map(s => s.id).filter(id => !state.reachedScreens.has(id));

  return { completed, blocked, unreachedScreens };
};

export { buildSoftlockReport };
