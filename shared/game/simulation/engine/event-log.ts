/* @layer shared-game @kind logic */
/**
 * The two SimEvent constructors, split out on their own so a module that only
 * needs to log (the dungeon ledger, in particular) never has to import the
 * rest of step-helpers.ts, which itself pulls in explorer.ts, and a ledger
 * module that explorer.ts calls into cannot import back through that chain.
 */
import type { SimEvent } from '../types';
import type { EngineState } from './state';

const narrative = (s: EngineState, msg: string): SimEvent => ({ level: 'narrative', msg, step: s.step });
const debug = (s: EngineState, msg: string, data?: unknown): SimEvent => ({ level: 'debug', msg, step: s.step, data });

export { narrative, debug };
