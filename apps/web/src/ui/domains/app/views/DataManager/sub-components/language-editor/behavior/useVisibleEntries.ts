/* @layer renderer-components @kind hook */
/**
 * Tracks which entry cards are near the viewport.
 *
 * A set holds a few hundred entries and every card draws its text box on a
 * canvas, so painting all of them at once would cost far more than a reader
 * can see. Cards report their element here; only the ones in view (plus a
 * screen's worth either side, so scrolling stays ahead of the reader) are told
 * to render their preview. Everything else keeps its placeholder.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** How far beyond the viewport a card starts painting. */
const PREFETCH_MARGIN = '600px';

const EMPTY: ReadonlySet<number> = new Set<number>();

type VisibleEntries = {
  visible: ReadonlySet<number>;
  /** Ref callback for a card's outer element; pass null on unmount. */
  observe: (id: number, element: HTMLElement | null) => void;
};

const useVisibleEntries = (): VisibleEntries => {
  const [visible, setVisible] = useState<ReadonlySet<number>>(EMPTY);
  const observer = useRef<IntersectionObserver | null>(null);
  const ids = useRef(new WeakMap<Element, number>());

  useEffect(() => {
    const seen = ids.current;
    const next = new IntersectionObserver((entries) => {
      setVisible((current) => {
        const updated = new Set(current);
        let changed = false;
        for (const entry of entries) {
          const id = seen.get(entry.target);
          if (id === undefined) continue;
          const has = updated.has(id);
          if (entry.isIntersecting && !has) { updated.add(id); changed = true; }
          if (!entry.isIntersecting && has) { updated.delete(id); changed = true; }
        }
        return changed ? updated : current;
      });
    }, { rootMargin: PREFETCH_MARGIN });

    observer.current = next;
    return () => { next.disconnect(); observer.current = null; };
  }, []);

  const observe = useCallback((id: number, element: HTMLElement | null) => {
    const active = observer.current;
    if (!active || !element) return;
    ids.current.set(element, id);
    active.observe(element);
  }, []);

  return useMemo(() => ({ visible, observe }), [visible, observe]);
};

export { useVisibleEntries };
export type { VisibleEntries };
