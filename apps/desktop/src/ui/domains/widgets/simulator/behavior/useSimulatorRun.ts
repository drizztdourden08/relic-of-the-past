/* @layer renderer-widgets @kind hook */
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
import { buildObservation, waitAfterTrigger } from '../../../../../lib/game/simulator/observe';
import type { DetectCache } from '../../../../../lib/game/simulator/observe';
import { fanOutEvents, screenFloodEvent, exitsEvent, sequenceEvent } from './runner-loop';
import { computeProgress } from './compute-progress';
import { buildRunResults } from './build-run-results';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { FEATURES_LATCH_WAIT_MS, PAUSED_POLL_MS, SAFETY_CAP, SEQUENCE_PREFIX } from '../SimulatorWidget.constants';
import type { RunControl } from '../SimulatorWidget.type';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const useSimulatorRun = () => {
  const [stopAtCheckId, setStopAtCheckId] = useWidgetPref<CheckId | ''>('simulator', 'stopAtCheckId', '');
  const [screenLimit, setScreenLimit] = useWidgetPref<number | null>('simulator', 'screenLimit', null);
  const [canRestore, setCanRestore] = useState(false);
  const screenLimitRef = useRef<number | null>(null);
  screenLimitRef.current = screenLimit;

  const control = useRef<RunControl>({ running: false, paused: false });
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

    const startEvents: SimEvent[] = [];
    const stopLabel = config.stopAtCheckId ? `stop at "${getCheck(config.stopAtCheckId).name}", ` : '';
    startEvents.push({ level: 'narrative', msg: `Run config: ${stopLabel}screen limit ${config.screenLimit ?? 'unlimited'}`, step: state.step });
    const seq = sequenceEvent(sequenceLabel, state.step);
    if (seq) { startEvents.push(seq); sequenceLabel = seq.msg.slice(SEQUENCE_PREFIX.length); }
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
      if (control.current.paused) { await sleep(PAUSED_POLL_MS); continue; }

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
      const seqChange = sequenceEvent(sequenceLabel, nextState.step);
      if (seqChange) {
        sequenceLabel = seqChange.msg.slice(SEQUENCE_PREFIX.length);
        fanOutEvents([seqChange], writer, store.pushEvents, recorder);
      }
      const frontierReseeded = screenChanged || nextState.epoch > previousEpoch;
      const backtrackingOrDone = nextState.phase === 'traversing' || nextState.stopHit || nextState.outcome;
      if (frontierReseeded && !backtrackingOrDone) {
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
    pauseSramSync();
    port.setSimulatorSupport(true);
    port.setAutoSkipDialog(true);
    port.setDeveloperTools(true);
    await new Promise((r) => setTimeout(r, FEATURES_LATCH_WAIT_MS));
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
    useSimulatorStore.getState().setStatus('done');
  }, []);

  const restore = useCallback(async () => {
    const buffer = snapshotRef.current;
    if (buffer && portRef.current) {
      await portRef.current.restoreState(buffer);
      resumeSramSync();
    }
  }, []);

  const openLog = useCallback(async () => {
    await writerRef.current?.openLog();
  }, []);

  return { stopAtCheckId, setStopAtCheckId, screenLimit, setScreenLimit, canRestore, start, pause, resume, stop, restore, openLog };
};

export { useSimulatorRun };
