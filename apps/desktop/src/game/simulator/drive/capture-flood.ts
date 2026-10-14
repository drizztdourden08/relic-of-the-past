/* @layer bridge-wasm @kind logic */
import type { EngineState } from '@rotp/navigation';
import { detectFor } from '../observe';
import type { DriveRun } from './drive-run.type';

const captureFlood = (run: DriveRun, st: EngineState): void => {
  const f = detectFor(st, run.cache)?.flood;
  if (f) run.screenFloods.push({ screenId: st.virtual.screenId, reachable: f.reachableCount, total: f.totalTiles, entrances: f.entranceCount, edges: f.edgeCount });
};

export { captureFlood };
