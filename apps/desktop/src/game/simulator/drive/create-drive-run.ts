/* @layer bridge-wasm @kind logic */
import type { SimulatorPort, SimConfig, SimRunConfig } from '@rotp/navigation';
import { createEngine, createEngineState, createRecorder, describeScreen } from '@rotp/navigation';
import { captureFlood } from './capture-flood';
import type { DriveRun } from './drive-run.type';
import { itemNames } from './item-names';

const createDriveRun = (port: SimulatorPort, config: SimRunConfig): DriveRun => {
  const base = port.observe();
  const engineConfig: SimConfig = {
    ...(config.stopAtCheckId ? { stopAtCheckId: config.stopAtCheckId } : {}),
    ...(config.screenWalkLimit != null ? { screenLimit: config.screenWalkLimit } : {}),
  };
  const state = createEngineState(base.virtual, base.inventory, engineConfig);
  const run: DriveRun = {
    engine: createEngine(),
    recorder: createRecorder(),
    state,
    steps: 0,
    reachedTarget: false,
    item: undefined,
    cache: new Map(),
    screenFloods: [],
    visits: [],
    path: [{ ...describeScreen(state.virtual.screenId), observed: true }],
    prevInv: itemNames(state.inventory),
    checks: [],
    log: [],
    tally: { regionJobs: 0, backtracks: 0, epochResets: 0, hops: 0 },
  };
  captureFlood(run, state);
  return run;
};

export { createDriveRun };
