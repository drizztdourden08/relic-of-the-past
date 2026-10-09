/* @layer bridge-wasm @kind logic */
import type { SimulatorPort, EngineState, SimConfig, SimRunConfig } from '@rotp/navigation';
import type { ItemId } from '@rotp/game-data';
import { getItem } from '@rotp/game-data';
import { createEngine, createEngineState, createRecorder, recordTransition, recordDoorGate, buildEndSummary } from '@rotp/navigation';
import { buildObservation, detectFor, waitAfterTrigger } from '../observe';
import type { DetectedScreen } from '@rotp/navigation';
import { describeScreen } from '@rotp/navigation';
import { recordEvents } from '@rotp/navigation';
import { noteEvents } from '@rotp/navigation';
import { visitOf } from '@rotp/navigation';
import type { CheckLog, DriveResult, DriveTally, LogLine, PathStep, ScreenFloodLog, VisitLog } from '@rotp/navigation';

const itemNames = (items: ReadonlySet<ItemId>): string[] => [...items].map((id) => getItem(id).name).sort();

const runSimulation = async (port: SimulatorPort, config: SimRunConfig): Promise<DriveResult> => {
  const engine = createEngine();
  const recorder = createRecorder();
  const base = port.observe();
  const engineConfig: SimConfig = {
    ...(config.stopAtCheckId ? { stopAtCheckId: config.stopAtCheckId } : {}),
    ...(config.screenWalkLimit != null ? { screenLimit: config.screenWalkLimit } : {}),
  };
  let state = createEngineState(base.virtual, base.inventory, engineConfig);
  let steps = 0;
  let reachedTarget = false;
  let item: ItemId | undefined;
  const unsub = port.onItemReceived((id) => { item = id; });
  const cache = new Map<string, DetectedScreen | null>();

  const screenFloods: ScreenFloodLog[] = [];
  const visits: VisitLog[] = [];
  const path: PathStep[] = [{ ...describeScreen(state.virtual.screenId), observed: true }];
  let prevInv: string[] = itemNames(state.inventory);
  const checks: CheckLog[] = [];
  const log: LogLine[] = [];
  const tally: DriveTally = { regionJobs: 0, backtracks: 0, epochResets: 0, hops: 0 };
  const captureFlood = (st: EngineState): void => {
    const f = detectFor(st, cache)?.flood;
    if (f) screenFloods.push({ screenId: st.virtual.screenId, reachable: f.reachableCount, total: f.totalTiles, entrances: f.entranceCount, edges: f.edgeCount });
  };
  captureFlood(state);

  try {
    while (!state.outcome && steps < config.maxSteps) {
      const prevScreen = state.virtual.screenId;
      const prevEpoch = state.epoch;
      const willObserve = state.phase === 'idle' || state.phase === 'observing';
      const obs = buildObservation(port, state, cache, item);
      item = undefined;
      if (willObserve) visits.push(visitOf(state, obs));
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      recordEvents(recorder, events, checks, path.length - 1, steps, itemNames(nextState.inventory));
      noteEvents(events, steps, log, path, tally);
      for (const action of actions) await port.trigger(action);

      state = nextState;
      steps += 1;
      const changedScreen = nextState.virtual.screenId !== prevScreen;
      if (changedScreen) {
        recordTransition(recorder, prevScreen, nextState.virtual.screenId);
        const inv = itemNames(nextState.inventory);
        const gained = inv.filter((i) => !prevInv.includes(i));
        const lost = prevInv.filter((i) => !inv.includes(i));
        prevInv = inv;
        path.push({
          ...describeScreen(nextState.virtual.screenId),
          observed: nextState.phase !== 'traversing',
          ...(gained.length > 0 ? { gained } : {}),
          ...(lost.length > 0 ? { lost } : {}),
        });
      }
      if ((changedScreen || nextState.epoch > prevEpoch) && nextState.phase !== 'traversing' && !nextState.stopHit && !nextState.outcome) captureFlood(nextState);
      if (config.target && state.visited.has(config.target)) { reachedTarget = true; break; }
      if (actions.length > 0) await waitAfterTrigger();
    }
  } finally {
    unsub();
  }

  return { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, log, tally, endSummary: buildEndSummary(state) };
};

export { runSimulation };
