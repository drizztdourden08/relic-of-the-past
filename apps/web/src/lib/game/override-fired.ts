/* @layer bridge-wasm @kind logic */
/**
 * Override-fired events: the C→JS completion signal for physical overrides.
 * When an in-core substitution table (npc / drop / standing) applies an entry,
 * the check that entry stands for is by definition completed at that instant;
 * the core reports the host-assigned fire id the arming call carried
 * (GameHook_NotifyOverrideFired → window.__onOverrideFired). Sessions use this
 * instead of save-flag or possession polling for their physical rows, because several
 * giver checks have no reliable flag, and possession reads false-fire when the
 * vanilla item arrives from elsewhere.
 */

type OverrideFiredHandler = (fireId: number) => void;

declare global {
  interface Window { __onOverrideFired?: ((fireId: number) => void) | null }
}

const armOverrideFiredEvents = (handler: OverrideFiredHandler): void => {
  // The core calls this synchronously from inside the wasm frame; defer to a
  // microtask so the handler never re-enters the module mid-execution.
  window.__onOverrideFired = (fireId: number) => {
    queueMicrotask(() => handler(fireId));
  };
};

const disarmOverrideFiredEvents = (): void => {
  window.__onOverrideFired = null;
};

export { armOverrideFiredEvents, disarmOverrideFiredEvents };
export type { OverrideFiredHandler };
