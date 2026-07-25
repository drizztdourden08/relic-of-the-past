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
import { SCREEN_BY_ID } from '@shared/game/data/screens';
import { detectScreenExits } from './screen-exits';
import type { DetectedScreen } from './screen-exits';

interface ScreenFloodLog {
  screenId: string;
  reachable: number;
  total: number;
  entrances: number;
  edges: number;
}

/** Screen id → room-addressable location (mirrors the widget's sim-location). */
const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen) return null;
  const isIndoors = screen.type !== 'overworld';
  const roomIndex = screen.roomIndex ?? 0;
  return { isIndoors, roomId: isIndoors ? roomIndex : 0, owScreenIndex: isIndoors ? 0 : roomIndex };
};

const TILE_REQS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot'];
const floodItems = (state: EngineState): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const t of state.reachTokens) if (TILE_REQS.includes(t)) items.add(t as TileReq);
  return [...items];
};

/** One detect per screen+epoch, shared by the log capture and traversal exits. */
const detectFor = (state: EngineState, cache: Map<string, DetectedScreen | null>): DetectedScreen | null => {
  // Keyed by entry REGION (quantized tile) too — a room re-entered through a
  // different door floods a different region and needs its own detection.
  const t = state.virtual.tile;
  const key = `${state.virtual.screenId}#${state.epoch}#${t.row >> 4},${t.col >> 4}`;
  if (!cache.has(key)) {
    cache.set(key, detectScreenExits(state.virtual.screenId, { entryTile: state.virtual.tile, items: floodItems(state) }));
  }
  return cache.get(key) ?? null;
};

/** Assemble the full observation for the screen the virtual Link is exploring. */
const buildObservation = (port: SimulatorPort, state: EngineState, detected: DetectedScreen | null, itemReceived?: number): SimObservation => {
  const base = port.observe();
  const loc = locationForScreen(state.virtual.screenId);
  if (!loc) return { ...base, itemReceived };
  const interactables = loc.isIndoors
    ? { chests: port.getRoomChests(loc.roomId), sprites: port.getRoomSprites(loc.roomId), doors: port.getRoomDoors(loc.roomId), tags: port.getRoomTags(loc.roomId) }
    : { chests: [], sprites: port.getOverworldSprites(loc.owScreenIndex), doors: [] };
  return { ...base, grids: port.getScreenGrids(loc), interactables, itemReceived, exits: detected?.exits, reached: detected?.reached };
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
      const obs = buildObservation(port, state, detectFor(state, cache), item);
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
