/* @layer bridge-wasm @kind logic */
import { getSessionState } from './get-session-state';
import { storeSlots } from './store-slots';

const notifySessionStore = (): void => {
  const state = getSessionState();
  for (const listener of storeSlots.listeners) {
    try { listener(state); } catch { continue; }
  }
};

export { notifySessionStore };
