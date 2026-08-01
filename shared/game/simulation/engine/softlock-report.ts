/* @layer shared-game @kind logic */
/**
 * Builds the SoftlockReport from a finished run: the checks completed, the
 * checks left blocked (with the requirement sets that gate their screen), and
 * the screens never reached.
 */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { SoftlockReport } from '../types';
import { find } from '../../data';
import type { CheckRecord, ScreenRecord } from '../../data';
import type { Adjacency } from './traversal';
import { buildAdjacency } from './traversal';
import type { EngineState } from './state';

interface ReportDeps {
  adjacency?: Adjacency;
  checks?: CheckRecord[];
  screens?: ScreenRecord[];
}

/** Requirement sets on every edge that leads into a screen — why it stayed blocked. */
const gatesInto = (adjacency: Adjacency, screenId: string): TraversalRequirement[][] => {
  const missing: TraversalRequirement[][] = [];
  for (const edges of adjacency.values()) {
    for (const edge of edges) {
      if (edge.to === screenId) {
        for (const group of edge.requirements) missing.push(group);
      }
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
    // By id: the name join marked all 11 dungeons' "Big Chest" complete the
    // moment any one of them was, so a blocked chest vanished from the report.
    .filter(c => !state.completedChecks.has(c.id) && (!c.screenId || !state.reachedScreens.has(c.screenId)))
    .map(c => ({ checkId: c.id, missing: c.screenId ? gatesInto(adjacency, c.screenId) : [] }));
  const unreachedScreens = screens.map(s => s.id).filter(id => !state.reachedScreens.has(id));

  return { completed, blocked, unreachedScreens };
};

export { buildSoftlockReport };
export type { ReportDeps };
