/* @layer bridge-wasm @kind logic */
/**
 * Headless sim drive loop for the `--sim-run` automation. Steps the pure engine
 * against a SimulatorPort exactly like the widget runner, but with no store/UI —
 * it only records into a RecorderState and returns the finished EngineState. The
 * interactive widget keeps its own runner (store + log fan-out); this is the
 * unattended path the data-correction loop uses.
 */
import type { SimulatorPort, SimObservation, SimEvent, DetectedCheck, EngineState, SimLocation, SimConfig, SimRunConfig } from '@shared/game/simulation';
import { createEngine, createEngineState, createRecorder, recordCheck, recordTransition, recordDoorGate, buildEndSummary } from '@shared/game/simulation';
import type { RecorderState } from '@shared/game/simulation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { GridPos } from '@shared/game/navigation';
import { displayNameFor } from './screen-location';
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

/**
 * One OBSERVE, recorded verbatim: where the virtual player stood and what the
 * detection handed the engine there. `screenFloods` cannot answer "why was this
 * exit never seen" — it only samples on a screen change outside traversal, which
 * skips every screen arrived at as a route destination.
 */
interface VisitLog {
  screenId: string;
  /** Dataset display name — for the log only, never for a decision. */
  name: string;
  indoors: boolean;
  /** Room index indoors, overworld screen index (0-63 = the map cell) outdoors. */
  index: number;
  tile: GridPos;
  epoch: number;
  reached: number;
  exits: Array<{ to: string; steps?: number; origin?: string }>;
}

const countReached = (grid?: boolean[][]): number =>
  grid ? grid.reduce((n, row) => n + row.reduce((m, v) => m + (v ? 1 : 0), 0), 0) : 0;

/**
 * Every screen the virtual player stood on, in order — including the ones a
 * multi-hop route only passed THROUGH. Those are never observed, so `visits`
 * skips them and two consecutive entries there can be nowhere near each other;
 * anything that needs a real walked route (a map, an adjacency claim) has to read
 * this instead.
 */
interface PathStep {
  screenId: string;
  name: string;
  indoors: boolean;
  index: number;
  /** False when the route only passed through without stopping to observe. */
  observed: boolean;
  /** How this screen was entered — see arrivalLabel. */
  via?: string;
  /** Items that appeared on arriving here. */
  gained?: string[];
  /** Items that VANISHED on arriving here. A durable item in this list means
   *  something wrote over its slot, which an end-of-run total cannot reveal. */
  lost?: string[];
}

const describeScreen = (screenId: string): Omit<PathStep, 'observed'> => {
  const loc = locationForScreen(screenId);
  return {
    screenId,
    name: displayNameFor(screenId),
    indoors: loc?.isIndoors ?? true,
    index: loc ? (loc.isIndoors ? loc.roomId : loc.owScreenIndex) : -1,
  };
};

/** A verified check, pinned to WHERE in the walked path it happened. */
interface CheckLog {
  name: string;
  screenId: string;
  /** Index into `path` at the moment it verified. */
  atPathIndex: number;
  step: number;
  /** Inventory the moment it verified — an item that LEAVES this list between two
   *  checks was clobbered by something, which no end-of-run total can show. */
  items: string[];
}

const recordEvents = (recorder: RecorderState, events: SimEvent[], checks: CheckLog[], pathIndex: number, step: number, items: string[]): void => {
  for (const event of events) {
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    if (!detected?.matchedName) continue;
    const loc = locationForScreen(detected.at.screenId);
    recordCheck(recorder, { name: detected.matchedName, screenId: detected.at.screenId, roomId: loc?.roomId ?? 0, tile: detected.at.tile });
    checks.push({ name: detected.matchedName, screenId: detected.at.screenId, atPathIndex: pathIndex, step, items });
  }
};

interface DriveResult {
  state: EngineState;
  recorder: RecorderState;
  steps: number;
  reachedTarget: boolean;
  screenFloods: ScreenFloodLog[];
  visits: VisitLog[];
  path: PathStep[];
  checks: CheckLog[];
  tally: { regionJobs: number; backtracks: number; epochResets: number; hops: number };
  endSummary: ReturnType<typeof buildEndSummary>;
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
  const visits: VisitLog[] = [];
  const path: PathStep[] = [{ ...describeScreen(state.virtual.screenId), observed: true }];
  let prevInv: string[] = [...state.inventory].sort();
  const checks: CheckLog[] = [];
  /** Does the region-memory path actually fire? Counted from the engine's own events. */
  const tally = { regionJobs: 0, backtracks: 0, epochResets: 0, hops: 0 };
  const captureFlood = (st: EngineState): void => {
    const f = detectFor(st, cache)?.flood;
    if (f) screenFloods.push({ screenId: st.virtual.screenId, reachable: f.reachableCount, total: f.totalTiles, entrances: f.entranceCount, edges: f.edgeCount });
  };
  captureFlood(state);

  try {
    while (!state.outcome && steps < config.maxSteps) {
      const prevScreen = state.virtual.screenId;
      const prevEpoch = state.epoch;
      // Only these two phases run `observe`, which is what records exits.
      const willObserve = state.phase === 'idle' || state.phase === 'observing';
      const obs = buildObservation(port, state, cache, item);
      item = undefined;
      if (willObserve) {
        visits.push({
          ...describeScreen(state.virtual.screenId),
          tile: state.virtual.tile,
          epoch: state.epoch,
          reached: countReached(obs.reached),
          exits: (obs.exits ?? []).map((e) => ({ to: e.to, ...(e.steps == null ? {} : { steps: e.steps }), ...(e.origin ? { origin: e.origin } : {}) })),
        });
      }
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      recordEvents(recorder, events, checks, path.length - 1, steps, [...nextState.inventory].sort());
      for (const e of events) {
        const m = /^Screen .+? (via .+|at \d+,\d+)$/.exec(e.msg);
        if (m && path.length > 0) path[path.length - 1].via = m[1];
        if (e.msg.includes('(new region)')) tally.regionJobs += 1;
        else if (e.msg.startsWith('Backtrack through')) tally.backtracks += 1;
        else if (e.msg.startsWith('Running ')) tally.hops += 1;
        else if (e.msg.includes('re-exploring after progress')) tally.epochResets += 1;
      }
      for (const action of actions) await port.trigger(action);

      state = nextState;
      steps += 1;
      const changedScreen = nextState.virtual.screenId !== prevScreen;
      if (changedScreen) {
        recordTransition(recorder, prevScreen, nextState.virtual.screenId);
        // 'traversing' means the route has further hops to make, so this screen is
        // being passed through and will never be observed.
        const inv = [...nextState.inventory].sort();
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
      // `target` = physically traversed to (visited), not merely flood-reachable.
      if (config.target && state.visited.has(config.target)) { reachedTarget = true; break; }
      if (actions.length > 0) await waitAfterTrigger();
    }
  } finally {
    unsub();
  }

  return { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, tally, endSummary: buildEndSummary(state) };
};

export { runSimulation };
export type { DriveResult, ScreenFloodLog, VisitLog, PathStep, CheckLog };
