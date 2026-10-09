/* @layer bridge-wasm @kind logic */
import { subscribeGameState } from '../wasm-bridge';
import { RESTORE_DELAYS_MS } from './cheat-rules-memory.constants';
import { readSavedRules } from './read-saved-rules';
import { rulesMemoryState } from './rules-memory-state';

const restoreCheatRules = (): void => {
  const saved = readSavedRules();
  for (const [key, apply] of rulesMemoryState.appliers) if (key in saved) apply(saved[key]);
  for (const listener of rulesMemoryState.restoredListeners) listener();
};

let armedFor: string | null = null;
subscribeGameState((state) => {
  if (state.status !== 'running') { armedFor = null; return; }
  if (armedFor === 'running') return;
  armedFor = 'running';
  for (const delay of RESTORE_DELAYS_MS) setTimeout(restoreCheatRules, delay);
});

export { restoreCheatRules };
