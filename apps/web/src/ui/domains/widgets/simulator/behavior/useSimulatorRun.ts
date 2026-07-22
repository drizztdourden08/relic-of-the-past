/* @layer renderer-widgets @kind hook */
/**
 * THE RUNNER. Owns the simulator loop: snapshots pre-run state (Memento), force-
 * enables auto-skip-dialog, drives the pure engine one step at a time, executes
 * returned triggers through the port, and fans events out to the store / log-bus
 * / JSONL sink. Stops on outcome, the Stop button, or the step safety cap.
 */
import { useCallback, useRef, useState } from 'react';
import type { SimulatorPort, SimConfig, EngineState } from '@shared/game/simulation';
import { createEngine, createEngineState, createRecorder, recordTransition, recordDoorGate } from '@shared/game/simulation';
import type { RecorderState } from '@shared/game/simulation';
import { createLiveGamePort, createSimLogWriter } from '@app/lib/game/simulator';
import type { SimLogWriter } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import { useSimulatorStore } from '@app/stores/simulator-store';
import { buildObservation, fanOutEvents, waitAfterTrigger } from './runner-loop';
import { computeProgress, buildRunResults } from './run-results';

const SAFETY_CAP = 50_000;

interface Control {
  running: boolean;
  paused: boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const useSimulatorRun = () => {
  const [stopAtCheckId, setStopAtCheckId] = useState<string>('');
  const [canRestore, setCanRestore] = useState(false);

  const control = useRef<Control>({ running: false, paused: false });
  const portRef = useRef<SimulatorPort | null>(null);
  const writerRef = useRef<SimLogWriter | null>(null);
  const snapshotRef = useRef<ArrayBuffer | null>(null);
  const itemRef = useRef<number | undefined>(undefined);

  const drive = useCallback(async (port: SimulatorPort, writer: SimLogWriter, config: SimConfig) => {
    const store = useSimulatorStore.getState();
    const recorder: RecorderState = createRecorder();
    const engine = createEngine();

    const base = port.observe();
    let state: EngineState = createEngineState(base.virtual, base.inventory, config);

    while (control.current.running && !state.outcome && state.step < SAFETY_CAP) {
      if (control.current.paused) { await sleep(120); continue; }

      const previousScreen = state.virtual.screenId;
      const obs = buildObservation(port, state, itemRef.current);
      itemRef.current = undefined;
      for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

      const { actions, events, nextState } = engine.step(state, obs);
      fanOutEvents(events, writer, store.pushEvents, recorder);
      for (const action of actions) await port.trigger(action);

      state = nextState;
      if (nextState.virtual.screenId !== previousScreen) {
        recordTransition(recorder, previousScreen, nextState.virtual.screenId);
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
    port.setAutoSkipDialog(true);
    const unsubscribe = port.onItemReceived((id) => { itemRef.current = id; });
    const config: SimConfig = stopAtCheckId ? { stopAtCheckId } : {};

    try {
      await drive(port, writer, config);
    } finally {
      unsubscribe();
      port.setAutoSkipDialog(null);
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

  return { stopAtCheckId, setStopAtCheckId, canRestore, start, pause, resume, stop, restore, openLog };
};

export { useSimulatorRun };
