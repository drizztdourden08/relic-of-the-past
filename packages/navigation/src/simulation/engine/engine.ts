/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent, TriggerAction } from '../types';
import { buildAdjacency } from './traversal/build-adjacency';
import { verifyStep } from './verify-step';
import type { EngineState } from './state/state.type';
import { cloneState } from './state/clone-state';
import type { EngineDeps, EngineEnv, StepResult } from './engine.type';
import { observe } from './phases/observe';
import { plan } from './phases/plan';
import { traverse } from './phases/traverse';
import { triggerTarget } from './phases/trigger-target';

const runPhase = (env: EngineEnv, s: EngineState, obs: SimObservation, out: StepResult): void => {
  const { events, actions } = out;
  if (s.phase === 'idle' || s.phase === 'observing') observe(env, s, obs, events);
  else if (s.phase === 'planning') plan(env, s, events);
  else if (s.phase === 'traversing') traverse(env, s, events);
  else if (s.phase === 'triggering') triggerTarget(s, obs, events, actions);
  else if (s.phase === 'verifying') verifyStep(s, obs, events);
};

const createEngine = ({ adjacency = buildAdjacency(), totalChecks }: EngineDeps = {}) => {
  const env: EngineEnv = { adjacency, totalChecks };

  const step = (input: EngineState, obs: SimObservation): StepResult => {
    const s = cloneState(input);
    s.step += 1;
    const events: SimEvent[] = [];
    const actions: TriggerAction[] = [];
    runPhase(env, s, obs, { actions, events, nextState: s });
    return { actions, events, nextState: s };
  };

  return { step };
};

export { createEngine };
export type { EngineDeps, StepResult } from './engine.type';
