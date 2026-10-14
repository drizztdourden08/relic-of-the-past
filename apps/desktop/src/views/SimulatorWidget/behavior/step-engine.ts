/* @layer renderer-widgets @kind logic */
import { recordDoorGate } from '@rotp/navigation';
import { buildObservation } from '@app/game/simulator/observe';
import type { RunContext, RunCursor, RunStepResult } from '../SimulatorWidget.type';
import { fanOutEvents } from './fan-out-events';

const stepEngine = async (ctx: RunContext, cursor: RunCursor): Promise<RunStepResult> => {
  const { port, writer, store, recorder, engine, detectCache, takeItem } = ctx;
  const obs = buildObservation(port, cursor.state, detectCache, takeItem());
  for (const door of obs.interactables?.doors ?? []) recordDoorGate(recorder, door);

  const { actions, events, nextState } = engine.step(cursor.state, obs);
  fanOutEvents(events, writer, store.pushEvents, recorder);
  for (const action of actions) await port.trigger(action);
  return { actions, events, nextState };
};

export { stepEngine };
