/* @layer bridge-wasm @kind logic */
import { getState } from './get-state';
import { queueState } from './queue-state';

const notify = (): void => {
  const state = getState();
  for (const listener of queueState.listeners) {
    try { listener(state); } catch { continue; }
  }
};

export { notify };
