/* @layer bridge-wasm @kind logic */
import type { SimulatorPort, SimRunConfig, DriveResult } from '@rotp/navigation';
import { buildEndSummary } from '@rotp/navigation';
import { waitAfterTrigger } from '../observe';
import { createDriveRun } from './create-drive-run';
import { stepOnce } from './step-once';

const runSimulation = async (port: SimulatorPort, config: SimRunConfig): Promise<DriveResult> => {
  const run = createDriveRun(port, config);
  const unsub = port.onItemReceived((id) => { run.item = id; });
  try {
    while (!run.state.outcome && run.steps < config.maxSteps) {
      const actionCount = await stepOnce(port, run);
      if (config.target && run.state.visited.has(config.target)) { run.reachedTarget = true; break; }
      if (actionCount > 0) await waitAfterTrigger();
    }
  } finally {
    unsub();
  }

  const { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, log, tally } = run;
  return { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, log, tally, endSummary: buildEndSummary(state) };
};

export { runSimulation };
