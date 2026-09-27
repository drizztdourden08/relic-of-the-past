/* @layer bridge-wasm @kind logic */
/**
 * When a save state was last loaded. A load swaps the whole game under the app, so whatever the
 * tracker finds done right after it was done in that state, not by the player just now. The
 * check toasts read this to stay quiet; the tracker itself still follows the loaded state.
 */
let lastLoadAt = 0;

const markStateLoaded = (): void => { lastLoadAt = Date.now(); };

/** True for |windowMs| after a load: long enough for the next sweep and its derived rows to land. */
const wasStateJustLoaded = (windowMs: number): boolean => Date.now() - lastLoadAt < windowMs;

export { markStateLoaded, wasStateJustLoaded };
