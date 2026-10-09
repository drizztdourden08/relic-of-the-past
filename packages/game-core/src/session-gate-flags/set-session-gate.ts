/* @layer bridge-wasm @kind logic */
import type { SessionGate } from './session-gate-flags.type';
import { armedGates } from './armed-gates';

const setSessionGate = (gate: SessionGate, on: boolean): void => {
  armedGates[gate] = on;
};

export { setSessionGate };
