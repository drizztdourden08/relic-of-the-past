/* @layer renderer-widgets @kind hook */
/**
 * THE RUNNER. Owns the simulator loop: snapshots pre-run state (Memento), force-
 * enables auto-skip-dialog, drives the pure engine one step at a time, executes
 * returned triggers through the port, and fans events out to the store / log-bus
 * / JSONL sink. Stops on outcome, the Stop button, or the step safety cap.
 */
import { useCallback, useRef, useState } from 'react';
import type { SimulatorPort, SimConfig, EngineState, SimEvent } from '@shared/game/simulation';
import { createEngine, createEngineState, createRecorder, recordTransition, recordDoorGate, screenLabel } from '@shared/game/simulation';
import type { RecorderState } from '@shared/game/simulation';
import type { CheckId, ItemId } from '@shared/game/data';
import { getCheck } from '@shared/game/data';
import { createLiveGamePort, createSimLogWriter, screenAreaInfo } from '@app/lib/game/simulator';
import type { SimLogWriter } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import { useSimulatorStore } from '@app/stores/simulator-store';
import { buildObservation, fanOutEvents, waitAfterTrigger, screenFloodEvent, exitsEvent, sequenceEvent } from './runner-loop';
import type { DetectCache } from './runner-loop';
import { computeProgress, buildRunResults } from './run-results';

const SAFETY_CAP = 50_000;

interface Control {
  running: boolean;
  paused: boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const useSimulatorRun = () => {
  const [stopAtCheckId, setStopAtCheckId] = useState<CheckId | ''>('');
  const [screenLimit, setScreenLimit] = useState<number | null>(null);
  const [canRestore, setCanRestore] = useState(false);
  const screenLimitRef = useRef<number | null>(null);
  screenLimitRef.current = screenLimit;

  const control = useRef<Control>({ running: false, paused: false });
  const portRef = useRef<SimulatorPort | null>(null);
  const writerRef = useRef<SimLogWriter | null>(null);
  const snapshotRef = useRef<ArrayBuffer | null>(null);
  const itemRef = useRef<ItemId | undefined>(undefined);

  const drive = useCallback(async (port: SimulatorPort, writer: SimLogWriter, config: SimConfig) => {
    const store = useSimulatorStore.getState();
    const recorder: RecorderState = createRecorder();
    const engine = createEngine();

    const base = port.observe();
    let state: EngineState = createEngineState(base.virtual, base.inventory, config);
    const detectCache: DetectCache = new Map();
    let sequenceLabel: string | null = null;

    // Config echo + sequence marker, then the starting screen's flood up front.
    const startEvents: SimEvent[] = [];
    const stopLabel = config.stopAtCheckId ? `stop at "${getCheck(config.stopAtCheckId).randomizerName}", ` : '';
    startEvents.push({ level: 'narrative', msg: `Run config: ${stopLabel}screen limit ${config.screenLimit ?? 'unlimited'}`, step: state.step });
    const seq = sequenceEvent(sequenceLabel, state.step);
    if (seq) { startEvents.push(seq); sequenceLabel = seq.msg.slice('Sequence '.length); }
    state.area = screenAreaInfo(state.virtual.screenId);
    if (state.area) startEvents.push({ level: 'narrative', msg: `Area ${state.area.label} (${state.area.size} sub-screens)`, step: state.step });
    startEvents.push({ level: 'narrative', msg: `Screen ${screenLabel(state.virtual.screenId)}`, step: state.step });
    startEvents.push({ level: 'narrative', msg: `START at ${state.virtual.tile.col},${state.virtual.tile.row}`, step: state.step });
    const startFlood = screenFloodEvent(state, detectCache);
    if (startFlood) startEvents.push(startFlood);
    const startExits = exitsEvent(state, detectCache);
    if (startExits) startEvents.push(startExits);
    fanOutEvents(startEvents, writer, store.pushEvents, recorder);

    while (control.current.running && !state.outcome && state.step < SAFETY_CAP) {
      if (control.current.paused) { await sleep(120); continue; }

      const previousScreen = state.virtual.screenId;
      const previousEpoch = state.epoch;
      const obs = buildObservation(port, state, detectCache, itemRef.current);
      itemRef.current = undefined;
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      fanOutEvents(events, writer, store.pushEvents, recorder);
      for (const action of actions) await port.trigger(action);

      state = nextState;
      const screenChanged = nextState.virtual.screenId !== previousScreen;
      if (screenChanged) recordTransition(recorder, previousScreen, nextState.virtual.screenId);
      // A check can flip the game's progress phase — surface it as a Sequence marker.
      const seqChange = sequenceEvent(sequenceLabel, nextState.step);
      if (seqChange) {
        sequenceLabel = seqChange.msg.slice('Sequence '.length);
        fanOutEvents([seqChange], writer, store.pushEvents, recorder);
      }
      // Re-flood on entering a new screen OR after an unlock re-seeds the frontier
      // (epoch bump), so the "Reset:" line is followed by the new reachability.
      // Never after the stop target hit / run end, and never on BACKTRACK
      // pass-through hops (phase stays 'traversing' — explored ground).
      if ((screenChanged || nextState.epoch > previousEpoch) && nextState.phase !== 'traversing' && !nextState.stopHit && !nextState.outcome) {
        const followups: SimEvent[] = [];
        const floodEvent = screenFloodEvent(nextState, detectCache);
        if (floodEvent) followups.push(floodEvent);
        const exitsLine = exitsEvent(nextState, detectCache);
        if (exitsLine) followups.push(exitsLine);
        if (followups.length > 0) fanOutEvents(followups, writer, store.pushEvents, recorder);
      }

      store.setProgress(computeProgress(state));
      const lastNarrative = [...events].reverse().find((e) => e.level === 'narrative');
      if (lastNarrative) store.setPhaseLabel(lastNarrative.msg);

      if (actions.length > 0) await waitAfterTrigger();
    }

    store.finishRun(buildRunResults(state, recorder));
  }, []);

  const start = useCallback(async () => {
    if (control.current.running) return;
    const runId = `run-${Date.now()}`;
    const port = createLiveGamePort();
    const writer = createSimLogWriter(runId);
    portRef.current = port;
    writerRef.current = writer;
    control.current = { running: true, paused: false };
    itemRef.current = undefined;
    useSimulatorStore.getState().beginRun(runId);

    snapshotRef.current = await port.snapshotState();
    setCanRestore(true);
    // The run drives real checks; pause SRAM disk sync so no 5s tick persists
    // half-simulated state to sram.dat mid-run. Resumed in the finally below.
    pauseSramSync();
    // Arms the WasmSim* mutators (kHostGate_SimulatorSupport) for this run's duration — without
    // it every door-unlock/kill-drop/cell-lock trigger silently no-ops. Dropped in the finally
    // below so a crashed or stopped run can never leave it armed against a live session.
    port.setSimulatorSupport(true);
    port.setAutoSkipDialog(true);
    // The simulation reads the game's combat tables to work out which of a room's
    // enemies actually gate it, and those queries sit behind the developer-tools
    // switch. Without this the tables answer empty, every room reads as having no
    // gating enemy, and a kill-gated room's shutters never reopen — the run walks
    // into the first one, is sealed in, and the frontier dies with everything past
    // it unreachable. The headless runner has always done this; the widget did not.
    // The gate is read-only instrumentation and the run is itself a developer tool,
    // so it may hold the switch for its own duration and must drop it afterwards,
    // which the finally below does. Never touches the user's persisted setting.
    port.setDeveloperTools(true);
    // A features word set here is only WANTED until the core latches it on its next
    // frame (zelda_rtl.c:989), so give it frames before anything reads the tables.
    await new Promise((r) => setTimeout(r, 500));
    const unsubscribe = port.onItemReceived((id) => { itemRef.current = id; });
    const config: SimConfig = {
      ...(stopAtCheckId ? { stopAtCheckId } : {}),
      ...(screenLimitRef.current != null ? { screenLimit: screenLimitRef.current } : {}),
    };

    try {
      await drive(port, writer, config);
    } finally {
      unsubscribe();
      port.setAutoSkipDialog(null);
      port.setDeveloperTools(null);
      port.setSimulatorSupport(false);
      control.current.running = false;
      resumeSramSync();
    }
  }, [drive, stopAtCheckId]);

  const pause = useCallback(() => {
    control.current.paused = true;
    useSimulatorStore.getState().setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    control.current.paused = false;
    useSimulatorStore.getState().setStatus('running');
  }, []);

  const stop = useCallback(() => {
    control.current.running = false;
    control.current.paused = false;
    // Flip the store immediately: the drive loop may be mid-await (trigger + frame
    // wait) and would otherwise leave status on 'running' until it next reaches
    // finishRun an iteration later. finishRun still runs and is idempotent here.
    useSimulatorStore.getState().setStatus('done');
  }, []);

  const restore = useCallback(async () => {
    const buffer = snapshotRef.current;
    if (buffer && portRef.current) {
      await portRef.current.restoreState(buffer);
      // Pre-run state is back in MEMFS; safe to persist again immediately.
      resumeSramSync();
    }
  }, []);

  const openLog = useCallback(async () => {
    await writerRef.current?.openLog();
  }, []);

  return { stopAtCheckId, setStopAtCheckId, screenLimit, setScreenLimit, canRestore, start, pause, resume, stop, restore, openLog };
};

export { useSimulatorRun };
