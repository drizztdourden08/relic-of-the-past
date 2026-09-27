/* @layer bridge-wasm @kind logic */
/**
 * When a save state was last loaded. A load swaps the whole game under the app, so whatever the
 * tracker finds done right after it was done in that state, not by the player just now. The
 * check toasts read this to stay quiet; the tracker itself still follows the loaded state.
 *
 * A load is also announced to listeners, for state that lives in the save and must be read
 * again (the online client's received index).
 */
let lastLoadAt = 0;
const listeners = new Set<() => void>();

const markStateLoaded = (): void => {
  lastLoadAt = Date.now();
  for (const listener of listeners) {
    try { listener(); } catch { /* a bad listener never breaks a load */ }
  }
};

/** Follows every state load; returns the unsubscribe. */
const onStateLoaded = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** True for |windowMs| after a load: long enough for the next sweep and its derived rows to land. */
const wasStateJustLoaded = (windowMs: number): boolean => Date.now() - lastLoadAt < windowMs;

export { markStateLoaded, onStateLoaded, wasStateJustLoaded };
