/* @layer bridge-wasm @kind logic */
/**
 * Headless sim drive loop for the `--sim-run` automation. Steps the pure engine
 * against a SimulatorPort exactly like the widget runner, but with no store/UI —
 * it only records into a RecorderState and returns the finished EngineState. The
 * interactive widget keeps its own runner (store + log fan-out); this is the
 * unattended path the data-correction loop uses.
 */
import type { SimulatorPort, SimObservation, SimEvent, DetectedCheck, EngineState, SimLocation, SimConfig, SimRunConfig } from '@shared/game/simulation';
import { createEngine, createEngineState, createRecorder, recordCheck, recordTransition, recordDoorGate } from '@shared/game/simulation';
import type { RecorderState } from '@shared/game/simulation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { buildObservation, detectFor, floodItems, locationForScreen, waitAfterTrigger } from './observe';
import type { DetectCache } from './observe';
import { detectScreenExits } from './screen-exits';
import type { DetectedScreen } from './screen-exits';

interface ScreenFloodLog {
  screenId: string;
  reachable: number;
  total: number;
  entrances: number;
  edges: number;
}

const recordEvents = (recorder: RecorderState, events: SimEvent[]): void => {
  for (const event of events) {
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    if (!detected?.matchedName) continue;
    const loc = locationForScreen(detected.at.screenId);
    recordCheck(recorder, { name: detected.matchedName, screenId: detected.at.screenId, roomId: loc?.roomId ?? 0, tile: detected.at.tile });
  }
};

interface DriveResult {
  state: EngineState;
  recorder: RecorderState;
  steps: number;
  reachedTarget: boolean;
  screenFloods: ScreenFloodLog[];
}

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
  let item: number | undefined;
  const unsub = port.onItemReceived((id) => { item = id; });
  const cache = new Map<string, DetectedScreen | null>();

  // Per-screen flood stats, captured on entry + unlock — the same numbers a
  // normal in-game flood produces, matching the widget.
  const screenFloods: ScreenFloodLog[] = [];
  const captureFlood = (st: EngineState): void => {
    const f = detectFor(st, cache)?.flood;
    if (f) screenFloods.push({ screenId: st.virtual.screenId, reachable: f.reachableCount, total: f.totalTiles, entrances: f.entranceCount, edges: f.edgeCount });
  };
  captureFlood(state);

  try {
    while (!state.outcome && steps < config.maxSteps) {
      const prevScreen = state.virtual.screenId;
      const prevEpoch = state.epoch;
      const obs = buildObservation(port, state, cache, item);
      item = undefined;
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      recordEvents(recorder, events);
      for (const action of actions) await port.trigger(action);

      state = nextState;
      steps += 1;
      const changedScreen = nextState.virtual.screenId !== prevScreen;
      if (changedScreen) recordTransition(recorder, prevScreen, nextState.virtual.screenId);
      if ((changedScreen || nextState.epoch > prevEpoch) && nextState.phase !== 'traversing' && !nextState.stopHit && !nextState.outcome) captureFlood(nextState);
      // `target` = physically traversed to (visited), not merely flood-reachable.
      if (config.target && state.visited.has(config.target)) { reachedTarget = true; break; }
      if (actions.length > 0) await waitAfterTrigger();
    }
  } finally {
    unsub();
  }

  return { state, recorder, steps, reachedTarget, screenFloods };
};

export { runSimulation };
export type { DriveResult, ScreenFloodLog };
