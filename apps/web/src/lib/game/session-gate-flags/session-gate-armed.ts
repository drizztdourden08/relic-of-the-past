/* @layer bridge-wasm @kind logic */
import type { SessionGate } from './session-gate-flags.type';
import { armedGates } from './armed-gates';

const sessionGateArmed = (gate: SessionGate): boolean => armedGates[gate];

export { sessionGateArmed };
