/* @layer bridge-wasm @kind logic */
import type { RuleApplier } from './cheat-rules-memory.type';
import { rulesMemoryState } from './rules-memory-state';

const registerCheatRule = (key: string, apply: RuleApplier): void => { rulesMemoryState.appliers.set(key, apply); };

export { registerCheatRule };
