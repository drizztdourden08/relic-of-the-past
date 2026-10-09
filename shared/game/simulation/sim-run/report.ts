/* @layer shared-game @kind logic */
import { find, tagKeysOf } from '@rotp/game-data';
import { toScreenIdOf } from '@rotp/game-data';
import { buildDatasetSuggestions } from '../recording/dataset-updates';
import type { EngineState } from '../engine/state';
import type { RecorderState } from '../recording/recorder';
import type { SimRunReport, BoundaryEdge, ReportMeta } from './sim-run.type';

const boundaryEdges = (reached: Set<string>): BoundaryEdge[] => {
  const seen = new Set<string>();
  const out: BoundaryEdge[] = [];
  const consider = (from: string, to: string, tags: string[]): void => {
    if (!reached.has(from) || reached.has(to)) return;
    const key = `${from}|${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ from, to, tags });
  };
  for (const c of find('connection', () => true)) {
    if (!c.canExit) continue;
    consider(c.screenId, toScreenIdOf(c), [...tagKeysOf(c.tags)]);
  }
  return out;
};

const buildSimRunReport = (state: EngineState, recorder: RecorderState, meta: ReportMeta): SimRunReport => {
  const { config, steps, reachedTarget } = meta;
  return {
    outcome: state.outcome,
    reachedTarget,
    startSlot: config.startSlot,
    target: config.target,
    steps,
    reachedScreens: [...state.reachedScreens].sort(),
    verifiedChecks: [...state.completedChecks].sort(),
    boundaryEdges: boundaryEdges(state.reachedScreens),
    suggestions: buildDatasetSuggestions(recorder),
  };
};

export { buildSimRunReport };
