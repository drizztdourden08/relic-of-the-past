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
import { SCREEN_BY_ID } from '@shared/game/data/screens';

/** Screen id → room-addressable location (mirrors the widget's sim-location). */
const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen) return null;
  const isIndoors = screen.type !== 'overworld';
  const roomIndex = screen.roomIndex ?? 0;
  return { isIndoors, roomId: isIndoors ? roomIndex : 0, owScreenIndex: isIndoors ? 0 : roomIndex };
};

/** Assemble the full observation for the screen the virtual Link is exploring. */
const buildObservation = (port: SimulatorPort, state: EngineState, itemReceived?: number): SimObservation => {
  const base = port.observe();
  const loc = locationForScreen(state.virtual.screenId);
  if (!loc) return { ...base, itemReceived };
  const interactables = loc.isIndoors
    ? { chests: port.getRoomChests(loc.roomId), sprites: port.getRoomSprites(loc.roomId), doors: port.getRoomDoors(loc.roomId) }
    : { chests: [], sprites: port.getOverworldSprites(loc.owScreenIndex), doors: [] };
  return { ...base, grids: port.getScreenGrids(loc), interactables, itemReceived };
};

/** Record every DetectedCheck an event carried so unmatched checks surface as suggestions. */
const recordEvents = (recorder: RecorderState, events: SimEvent[]): void => {
  for (const event of events) {
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    if (!detected?.matchedName) continue;
    const loc = locationForScreen(detected.at.screenId);
    recordCheck(recorder, { name: detected.matchedName, screenId: detected.at.screenId, roomId: loc?.roomId ?? 0, tile: detected.at.tile });
  }
};

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
/** ~2 frames so the game advances the trigger / item grant before the next step. */
const waitAfterTrigger = async (): Promise<void> => { await nextFrame(); await nextFrame(); };

interface DriveResult {
  state: EngineState;
  recorder: RecorderState;
  steps: number;
  reachedTarget: boolean;
}

const runSimulation = async (port: SimulatorPort, config: SimRunConfig): Promise<DriveResult> => {
  const engine = createEngine();
  const recorder = createRecorder();
  const base = port.observe();
  const engineConfig: SimConfig = config.stopAtCheckId ? { stopAtCheckId: config.stopAtCheckId } : {};
  let state = createEngineState(base.virtual, base.inventory, engineConfig);
  let steps = 0;
  let reachedTarget = false;
  let item: number | undefined;
  const unsub = port.onItemReceived((id) => { item = id; });

  try {
    while (!state.outcome && steps < config.maxSteps) {
      const prevScreen = state.virtual.screenId;
      const obs = buildObservation(port, state, item);
      item = undefined;
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      recordEvents(recorder, events);
      for (const action of actions) await port.trigger(action);

      state = nextState;
      steps += 1;
      if (nextState.virtual.screenId !== prevScreen) recordTransition(recorder, prevScreen, nextState.virtual.screenId);
      // `target` = physically traversed to (visited), not merely flood-reachable.
      if (config.target && state.visited.has(config.target)) { reachedTarget = true; break; }
      if (actions.length > 0) await waitAfterTrigger();
    }
  } finally {
    unsub();
  }

  return { state, recorder, steps, reachedTarget };
};

export { runSimulation };
export type { DriveResult };
