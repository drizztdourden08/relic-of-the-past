/* @layer renderer-widgets @kind hook */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { ANCHOR_GAP, VIEWPORT_EDGE } from '../CheatsWidget.constants';
import type { Placement } from '../CheatsWidget.type';

const useAnchoredPlacement = (ref: RefObject<HTMLElement | null>, anchor: HTMLElement | null, contentKey: unknown): Placement => {
  const [place, setPlace] = useState<Placement>({ left: 0, top: 0, placed: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = a.left;
    let top = a.bottom + ANCHOR_GAP;
    if (left + w > window.innerWidth - VIEWPORT_EDGE) left = Math.max(VIEWPORT_EDGE, window.innerWidth - w - VIEWPORT_EDGE);
    if (top + h > window.innerHeight - VIEWPORT_EDGE) top = Math.max(VIEWPORT_EDGE, a.top - h - ANCHOR_GAP);
    setPlace({ left, top, placed: true });
  }, [ref, anchor, contentKey]);

  return place;
};

export { useAnchoredPlacement };
