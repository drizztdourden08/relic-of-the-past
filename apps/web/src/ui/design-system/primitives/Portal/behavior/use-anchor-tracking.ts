/* @layer renderer-components @kind hook */
/**
 * Keeps a portalled panel pinned to its anchor for as long as it is open.
 *
 * Positioning once, at open, only holds while nothing moves, so the position is
 * recomputed on every scroll heard anywhere in the tree. The listener is
 * registered in the capture phase because scroll events do not bubble and
 * capture is the only way a window-level listener hears one fired on an inner
 * container.
 *
 * Once the anchor has scrolled out of the region it is visible through,
 * `onOutOfView` fires so the caller can dismiss the panel.
 *
 * Callers supply `compute`, which turns the anchor's rect into whatever shape
 * they position with. It is read through a ref, so it need not be memoised.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clippingAncestorsOf, overlaps, visibleBoundsOf } from './anchor-position';
import { observeAnchorMovement } from './observe-anchor-movement';
import type { RefObject } from 'react';

interface UseAnchorTrackingParams<T> {
  /** Whether the panel is open. Listeners exist only while this is true. */
  active: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  compute: (rect: DOMRect) => T;
  /** Fired when the anchor scrolls out of sight, usually the panel's close handler. */
  onOutOfView?: () => void;
}

interface UseAnchorTrackingResult<T> {
  /** Null until the anchor has been measured, and again once inactive. */
  position: T | null;
  /** Re-measures immediately, without the out-of-view check. */
  reposition: () => void;
}

const useAnchorTracking = <T>(params: UseAnchorTrackingParams<T>): UseAnchorTrackingResult<T> => {
  const { active, anchorRef, compute, onOutOfView } = params;

  const [position, setPosition] = useState<T | null>(null);
  const computeRef = useRef(compute);
  const outOfViewRef = useRef(onOutOfView);
  const clipsRef = useRef<readonly Element[]>([]);

  computeRef.current = compute;
  outOfViewRef.current = onOutOfView;

  const measure = useCallback((dismissWhenHidden: boolean) => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    if (dismissWhenHidden && !overlaps(rect, visibleBoundsOf(clipsRef.current))) {
      outOfViewRef.current?.();
      return;
    }
    setPosition(computeRef.current(rect));
  }, [anchorRef]);

  const reposition = useCallback(() => measure(false), [measure]);

  // Opening measures straight away, and resolves the clip chain once so the
  // scroll handler never has to touch getComputedStyle.
  useLayoutEffect(() => {
    if (!active) {
      clipsRef.current = [];
      setPosition(null);
      return;
    }
    clipsRef.current = anchorRef.current ? clippingAncestorsOf(anchorRef.current) : [];
    measure(false);
  }, [active, anchorRef, measure]);

  useEffect(() => {
    if (!active) return undefined;
    return observeAnchorMovement(window, {
      onScroll: () => measure(true),
      onResize: () => measure(false),
    });
  }, [active, measure]);

  return { position, reposition };
};

export { useAnchorTracking };
export type { UseAnchorTrackingParams, UseAnchorTrackingResult };
