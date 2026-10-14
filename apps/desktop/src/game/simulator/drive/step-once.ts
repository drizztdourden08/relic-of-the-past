/* @layer bridge-wasm @kind logic */
import type { SimulatorPort } from '@rotp/navigation';
import { recordDoorGate, recordEvents, noteEvents, visitOf } from '@rotp/navigation';
import { buildObservation } from '../observe';
import type { DriveRun } from './drive-run.type';
import { itemNames } from './item-names';
import { trackScreenChange } from './track-screen-change';

const stepOnce = async (port: SimulatorPort, run: DriveRun): Promise<number> => {
  const prevScreen = run.state.virtual.screenId;
  const prevEpoch = run.state.epoch;
  const willObserve = run.state.phase === 'idle' || run.state.phase === 'observing';
  const obs = buildObservation(port, run.state, run.cache, run.item);
  run.item = undefined;
  if (willObserve) run.visits.push(visitOf(run.state, obs));
  for (const door of obs.interactables?.doors ?? []) recordDoorGate(run.recorder, door);

  const { actions, events, nextState } = run.engine.step(run.state, obs);
  recordEvents(run.recorder, events, run.checks, { pathIndex: run.path.length - 1, step: run.steps, items: itemNames(nextState.inventory) });
  noteEvents(events, run.steps, { log: run.log, path: run.path, tally: run.tally });
  for (const action of actions) await port.trigger(action);

  run.state = nextState;
  run.steps += 1;
  trackScreenChange(run, prevScreen, prevEpoch);
  return actions.length;
};

export { stepOnce };
