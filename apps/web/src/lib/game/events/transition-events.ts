/* @layer bridge-wasm @kind logic */
/**
 * Bridge for window.__onTransitionSettled (see GameHook_ModuleFrameEnd, transition_events.c).
 *
 * The core fires this once per frame that a module or dungeon-submodule transition has just
 * finished, gated on the Developer Tools setting. Subscribing while that setting is off is
 * harmless: the core simply never calls in, so the callback never fires.
 */
import { classifyTransition } from './classify-transition';
import type { TransitionListener, TransitionSettled } from './transition-events.type';

const listeners = new Set<TransitionListener>();

const initTransitionEventsBridge = (): void => {
  (window as unknown as Record<string, unknown>).__onTransitionSettled =
    (module: number, fromSubmodule: number, indoors: number, roomIndex: number, owScreenIndex: number) => {
      const event: TransitionSettled = {
        kind: classifyTransition(module, fromSubmodule),
        module,
        fromSubmodule,
        isIndoors: indoors === 1,
        roomIndex,
        owScreenIndex,
      };
      for (const listener of listeners) {
        try { listener(event); } catch { /* ignore */ }
      }
    };
};

const destroyTransitionEventsBridge = (): void => {
  (window as unknown as Record<string, unknown>).__onTransitionSettled = null;
};

/** Subscribe to transition-settled events. Returns an unsubscribe function. */
const subscribeTransitionSettled = (listener: TransitionListener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export { initTransitionEventsBridge, destroyTransitionEventsBridge, subscribeTransitionSettled };
