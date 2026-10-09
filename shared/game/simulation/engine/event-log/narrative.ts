/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import type { EngineState } from '../state/state.type';

const narrative = (s: EngineState, msg: string): SimEvent => ({ level: 'narrative', msg, step: s.step });

export { narrative };
