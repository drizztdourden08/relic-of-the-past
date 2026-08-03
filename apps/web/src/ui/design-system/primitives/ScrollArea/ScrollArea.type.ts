/* @layer renderer-components @kind types */
import type { ComponentPropsWithRef } from 'react';

/** Which way the region is allowed to scroll. The other axis is clipped. */
type ScrollAxis = 'y' | 'x' | 'both';

/** A scroll offset pair, as read from (and written to) the scrolling node. */
interface ScrollPosition {
  top: number;
  left: number;
}

interface ScrollAreaProps extends Omit<ComponentPropsWithRef<'div'>, 'onScroll'> {
  /** Defaults to `'y'` — the common case of a tall list in a fixed-height shell. */
  axis?: ScrollAxis;
  /**
   * Fires with the node's current offsets on a real, user-driven scroll.
   * Does NOT fire for the echo of a `scrollTo` this component applied itself
   * (see the guard in behavior/create-scroll-guard.ts) — otherwise two
   * `ScrollArea`s wired to mirror each other would ping-pong forever.
   */
  onScroll?: (position: ScrollPosition) => void;
  /**
   * Imperatively scrolls the node whenever the given field(s) change — e.g.
   * to drive a second `ScrollArea` to the same offset as a first. An omitted
   * field keeps its current value; passing the same values twice is a no-op.
   */
  scrollTo?: Partial<ScrollPosition>;
}

export type { ScrollAreaProps, ScrollAxis, ScrollPosition };
