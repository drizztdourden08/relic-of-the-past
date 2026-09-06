/* @layer renderer-components @kind logic */
import type { ScrollPosition } from '../ScrollArea.type';

/**
 * Suppresses the scroll-event echo a programmatic `scrollTo` produces, so it
 * never reaches the caller's `onScroll`. That is what keeps two `ScrollArea`s
 * wired to mirror each other from ping-ponging forever.
 *
 * A single "consumed once" flag is not enough: `.scroll-area` sets
 * `scroll-behavior: smooth`, so one `scrollTo()` call can fire several native
 * `scroll` events over the course of the animation, not just one. Instead,
 * this tracks the exact target the caller committed to and keeps suppressing
 * every event until the node reports having reached it, arrival event included.
 * Then it gets out of the way again.
 */
const createScrollGuard = () => {
  let pendingTarget: ScrollPosition | null = null;

  /** Call right after applying a programmatic scroll, with the position the
   * node settled on (post-clamping), so the target can never be one
   * the node is unable to reach. */
  const markProgrammatic = (target: ScrollPosition): void => {
    pendingTarget = target;
  };

  /** Call from the native `scroll` handler. Returns whether this event is
   * part of the programmatic scroll in flight (and should be swallowed). */
  const shouldSuppress = (current: ScrollPosition): boolean => {
    if (!pendingTarget) return false;
    if (current.top === pendingTarget.top && current.left === pendingTarget.left) pendingTarget = null;
    return true;
  };

  return { markProgrammatic, shouldSuppress };
};

export { createScrollGuard };
