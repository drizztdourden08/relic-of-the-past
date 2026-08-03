/* @layer renderer-components @kind logic */
import { createScrollGuard } from './create-scroll-guard';
import type { ScrollPosition } from '../ScrollArea.type';

/** The slice of a scrolling element this controller needs — real enough that
 * an `HTMLDivElement` satisfies it, minimal enough that a plain test object
 * standing in for one does too, with no DOM or React involved. */
interface ScrollNode {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  scrollTo: (options: ScrollToOptions) => void;
}

/**
 * Owns the "drive this node to a requested offset without echoing that back
 * out as a user scroll" behavior for one `ScrollArea` instance. Framework-free
 * so the same logic that ships in the component is exactly what a test can
 * drive directly, against a fake node, with two instances wired to mirror
 * each other.
 */
const createScrollSyncController = (getNode: () => ScrollNode | null) => {
  const guard = createScrollGuard();

  /** Imperatively moves the node toward `target` (missing fields hold their
   * current value), instantly rather than via the CSS's smooth default, then
   * arms the guard with where the node actually settled. A no-op if the node
   * is already there, or not mounted yet.
   *
   * `'instant'` rather than `'auto'`, and the difference is load-bearing:
   * `'auto'` defers to the element's `scroll-behavior`, which `.scroll-area`
   * sets to `smooth`. The move would then ANIMATE, the read on the next line
   * would report where the node still is rather than where it is going, and the
   * guard would be armed with a position the node is leaving — after which it
   * suppresses every event forever, because the target it is waiting for never
   * comes back. A mirrored pane would follow once and then go deaf. */
  const applyScrollTo = (target: Partial<ScrollPosition>): void => {
    const node = getNode();
    if (!node) return;
    const nextTop = target.top ?? node.scrollTop;
    const nextLeft = target.left ?? node.scrollLeft;
    if (nextTop === node.scrollTop && nextLeft === node.scrollLeft) return;
    node.scrollTo({ top: nextTop, left: nextLeft, behavior: 'instant' });
    guard.markProgrammatic({ top: node.scrollTop, left: node.scrollLeft });
  };

  /** Feeds a native scroll event's position through the guard, forwarding to
   * `onScroll` only when it isn't the echo of this controller's own
   * `applyScrollTo`. */
  const handleScroll = (current: ScrollPosition, onScroll?: (position: ScrollPosition) => void): void => {
    if (guard.shouldSuppress(current)) return;
    onScroll?.(current);
  };

  return { applyScrollTo, handleScroll };
};

export { createScrollSyncController };
export type { ScrollNode };
