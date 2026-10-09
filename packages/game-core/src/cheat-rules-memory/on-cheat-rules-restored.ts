/* @layer bridge-wasm @kind logic */
import { rulesMemoryState } from './rules-memory-state';

const onCheatRulesRestored = (listener: () => void): (() => void) => {
  rulesMemoryState.restoredListeners.add(listener);
  return () => { rulesMemoryState.restoredListeners.delete(listener); };
};

export { onCheatRulesRestored };
