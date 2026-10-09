/* @layer bridge-wasm @kind logic */
import type { RuleApplier } from './cheat-rules-memory.type';

const rulesMemoryState = {
  appliers: new Map<string, RuleApplier>(),
  restoredListeners: new Set<() => void>(),
};

export { rulesMemoryState };
