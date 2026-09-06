/* @layer renderer-components @kind hook */
/**
 * Keeps a sideways-scrolling strip and its paging controls in step.
 *
 * It owns three things the presentational strip should not: the measurement of
 * whether the tabs overrun their box (re-taken whenever the box, a tab, or the
 * tab count changes), the wheel listener that turns a plain downward wheel into
 * sideways travel, and the two movements: one page, or one tab into view.
 *
 * Every movement goes through `scrollBy`/`scrollIntoView` with the default
 * behaviour, which defers to the strip's own `scroll-behavior`. That is what
 * makes the strip glide, and what makes it stop gliding under
 * `prefers-reduced-motion`, where the media query in the stylesheet is the single
 * place the choice is made.
 *
 * The wheel listener is attached by hand instead of through `onWheel` because
 * React registers wheel handlers passively, and a passive listener cannot claim
 * the gesture.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { NO_OVERFLOW, edgesForMetrics, pageDeltaFor, sameEdges } from './strip-geometry';
import { wheelScrollDelta } from './wheel-scroll-delta';
import type { StripEdges, StripMetrics } from './strip-geometry';

const metricsOf = (node: HTMLElement): StripMetrics => ({
  scrollLeft: node.scrollLeft,
  scrollWidth: node.scrollWidth,
  clientWidth: node.clientWidth,
});

const useTabStripOverflow = (tabCount: number) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState<StripEdges>(NO_OVERFLOW);

  const measure = useCallback((): void => {
    const node = stripRef.current;
    if (!node) return;
    const next = edgesForMetrics(metricsOf(node));
    setEdges((prev) => (sameEdges(prev, next) ? prev : next));
  }, []);

  // The box resizing and a tab changing width (a badge appearing, say) both
  // change what fits, and neither is a render of this component, hence the
  // observer over the strip AND its tabs, re-hung when the tab count changes.
  useEffect(() => {
    const node = stripRef.current;
    if (!node) return undefined;
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    for (const child of Array.from(node.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, tabCount]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const handleWheel = (event: WheelEvent): void => {
      const node = stripRef.current;
      if (!node) return;
      const delta = wheelScrollDelta(event, metricsOf(node));
      if (delta === null) return;
      event.preventDefault();
      node.scrollBy({ left: delta });
    };
    root.addEventListener('wheel', handleWheel, { passive: false });
    return () => root.removeEventListener('wheel', handleWheel);
  }, []);

  const pageBy = useCallback((direction: -1 | 1): void => {
    const node = stripRef.current;
    if (!node) return;
    node.scrollBy({ left: pageDeltaFor(node.clientWidth, direction) });
  }, []);

  const revealTab = useCallback((tab: HTMLElement): void => {
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, []);

  return {
    rootRef,
    stripRef,
    canScrollBack: edges.canScrollBack,
    canScrollForward: edges.canScrollForward,
    isOverflowing: edges.canScrollBack || edges.canScrollForward,
    handleScroll: measure,
    pageBy,
    revealTab,
  };
};

export { useTabStripOverflow };
