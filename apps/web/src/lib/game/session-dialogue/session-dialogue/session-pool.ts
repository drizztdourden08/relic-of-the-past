/* @layer bridge-wasm @kind logic */
import { createArrivalRing } from '../arrival-ring';
import type { SessionPool } from './session-pool.type';

const sessionPool: SessionPool = {
  plannedLines: [],
  arrivals: createArrivalRing(),
  active: null,
  baseId: null,
  encoded: new Map<string, Uint8Array>(),
};

export { sessionPool };
