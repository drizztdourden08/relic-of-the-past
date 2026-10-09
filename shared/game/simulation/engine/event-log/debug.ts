/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import type { EngineState } from '../state/state.type';

const debug = (s: EngineState, msg: string, data?: unknown): SimEvent => ({ level: 'debug', msg, step: s.step, data });

export { debug };
