/* @layer shared-game @kind types */
import type { SimEvent, TriggerAction } from '../types';
import type { Adjacency } from './traversal/traversal.type';
import type { EngineState } from './state/state.type';

interface EngineDeps {
  adjacency?: Adjacency;
  totalChecks?: number;
}

interface StepResult {
  actions: TriggerAction[];
  events: SimEvent[];
  nextState: EngineState;
}

export type { EngineDeps, StepResult };
