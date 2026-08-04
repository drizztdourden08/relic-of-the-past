/* @layer shared-game @kind logic */
/**
 * Pure builder: turns a finished EngineState + RecorderState into a SimRunReport.
 * `boundaryEdges` are the dataset edges that leave the reached set — the places
 * to point `--dump-nav` at when hunting a missing/blocked connection.
 */
import { find, tagKeysOf } from '../../data';
import { toScreenIdOf } from '../../data/connections/derive';
import { buildDatasetSuggestions } from '../recording/dataset-updates';
import type { EngineState } from '../engine/state';
import type { RecorderState } from '../recording/recorder';
import type { SimRunConfig, SimRunReport, BoundaryEdge } from './types';

/** Edges from a reached screen to an unreached one — one per exitable point (a
 *  two-way crossing already surfaces both orientations as separate records). */
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
  // The report is read by a person, so it carries the terms rather than the ids.
  for (const c of find('connection', () => true)) {
    if (!c.canExit) continue;
    consider(c.screenId, toScreenIdOf(c), [...tagKeysOf(c.tags)]);
  }
  return out;
};

interface ReportMeta {
  config: SimRunConfig;
  steps: number;
  reachedTarget: boolean;
}

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
