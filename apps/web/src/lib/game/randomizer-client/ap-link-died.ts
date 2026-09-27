/* @layer bridge-wasm @kind logic */
/**
 * The core's death signal for DeathLink: the core calls `window.__onLinkDied(cause)` when
 * Link dies. One listener at a time, since one online session owns the room.
 *
 * The core's cause is a number (death_link.c): 1 when the room's kill caused the death, 0 for
 * any other. A string is the death's own wording, from a host that has one.
 */

/** The cause number the core passes for a death the room's kill caused. */
const CAUSE_BY_ROOM = 1;

interface LinkDeath {
  /** The room's own kill caused this death, so it is never sent back out. */
  byRoom: boolean;
  /** The death's wording; empty when the core has none. */
  text: string;
}

type LinkDiedListener = (death: LinkDeath) => void;

declare global {
  interface Window { __onLinkDied?: ((cause?: unknown) => void) | null }
}

/** What the core's |cause| argument says about the death. */
const deathOf = (cause: unknown): LinkDeath => ({
  byRoom: cause === CAUSE_BY_ROOM,
  text: typeof cause === 'string' ? cause : '',
});

/** Follows Link's deaths; returns the unsubscribe. */
const onLinkDied = (listener: LinkDiedListener): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handler = (cause?: unknown): void => {
    // The core calls this from inside the wasm frame, so the listener runs after it returns.
    queueMicrotask(() => listener(deathOf(cause)));
  };
  window.__onLinkDied = handler;
  return () => {
    if (window.__onLinkDied === handler) window.__onLinkDied = null;
  };
};

export { deathOf, onLinkDied };
export type { LinkDeath, LinkDiedListener };
