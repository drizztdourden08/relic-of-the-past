/* @layer renderer-widgets @kind hook */
/**
 * Places a portalled box under its anchor in viewport coordinates: flush with the anchor's
 * left edge, pulled back from the window's right edge when it would spill, and flipped above
 * the anchor when there is no room below. Re-measured when the anchor or the content changes.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

const GAP = 4;
const EDGE = 6;

type Placement = { left: number; top: number; placed: boolean };

const useAnchoredPlacement = (ref: RefObject<HTMLElement | null>, anchor: HTMLElement | null, contentKey: unknown): Placement => {
  const [place, setPlace] = useState<Placement>({ left: 0, top: 0, placed: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = a.left;
    let top = a.bottom + GAP;
    if (left + w > window.innerWidth - EDGE) left = Math.max(EDGE, window.innerWidth - w - EDGE);
    if (top + h > window.innerHeight - EDGE) top = Math.max(EDGE, a.top - h - GAP);
    setPlace({ left, top, placed: true });
  }, [ref, anchor, contentKey]);

  return place;
};

export { useAnchoredPlacement };
export type { Placement };
