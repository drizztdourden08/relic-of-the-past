/* @layer renderer-widgets @kind logic */
import { createEngine, createEngineState, createRecorder } from '@rotp/navigation';
import { useSimulatorStore } from '@app/stores/simulator-store';
import { waitAfterTrigger } from '@app/game/simulator/observe';
import { PAUSED_POLL_MS, SAFETY_CAP } from '../SimulatorWidget.constants';
import type { DriveParams, RunContext, RunCursor } from '../SimulatorWidget.type';
import { afterStep } from './after-step';
import { buildRunResults } from './build-run-results';
import { buildStartEvents } from './build-start-events';
import { fanOutEvents } from './fan-out-events';
import { sleep } from './sleep';
import { stepEngine } from './step-engine';

const driveRun = async (params: DriveParams): Promise<void> => {
  const { port, writer, config, control, takeItem } = params;
  const store = useSimulatorStore.getState();
  const recorder = createRecorder();
  const base = port.observe();
  const cursor: RunCursor = { state: createEngineState(base.virtual, base.inventory, config), sequenceLabel: null };
  const ctx: RunContext = { port, writer, store, recorder, engine: createEngine(), detectCache: new Map(), takeItem };

  fanOutEvents(buildStartEvents(cursor, ctx.detectCache, config), writer, store.pushEvents, recorder);

  while (control.current.running && !cursor.state.outcome && cursor.state.step < SAFETY_CAP) {
    if (control.current.paused) { await sleep(PAUSED_POLL_MS); continue; }
    const previous = { screenId: cursor.state.virtual.screenId, epoch: cursor.state.epoch };
    const result = await stepEngine(ctx, cursor);
    cursor.state = result.nextState;
    afterStep(ctx, cursor, previous, result);
    if (result.actions.length > 0) await waitAfterTrigger();
  }

  store.finishRun(buildRunResults(cursor.state, recorder));
};

export { driveRun };
