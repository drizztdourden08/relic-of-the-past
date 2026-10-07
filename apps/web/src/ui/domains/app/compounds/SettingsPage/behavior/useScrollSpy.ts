/* @layer renderer-components @kind hook */
/**
 * Follows the settings body's scroll: which section anchor is current, and
 * whether the page has scrolled far enough for the header to compact. Anchor
 * targets are the body's `[data-section]` elements, so the page needs no refs
 * into its content.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Scroll distance (px) past which the header compacts. */
const COMPACT_AFTER = 24;
/** How far below the body's top edge a section still counts as current (px). */
const CURRENT_SLACK = 48;

/**
 * Compacts past the threshold and expands only once the body is back at its top while it
 * still overflows. Compacting hands the header's height to the body, which can remove the
 * overflow on a page that barely scrolls; the browser then clamps scrollTop to 0 on its own.
 * Reading that clamp as a return to the top expanded the header, which brought the overflow
 * back, and the page flipped between the two states without end.
 */
const nextCompact = (body: HTMLElement, was: boolean): boolean => {
  if (body.scrollTop > COMPACT_AFTER) return true;
  if (!was) return false;
  return !(body.scrollTop === 0 && body.scrollHeight > body.clientHeight);
};

const sectionEl = (body: HTMLElement, id: string): HTMLElement | null =>
  body.querySelector<HTMLElement>(`[data-section="${id}"]`);

const useScrollSpy = (ids: readonly string[]) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  const [compact, setCompact] = useState(false);

  const update = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    setCompact((was) => nextCompact(body, was));
    const top = body.getBoundingClientRect().top + CURRENT_SLACK;
    // The lowest section already under the line. Sections side by side on a dashboard row share
    // one top, and the first of them stands for the row.
    let current = ids[0] ?? '';
    let currentTop = Number.NEGATIVE_INFINITY;
    for (const id of ids) {
      const sectionTop = sectionEl(body, id)?.getBoundingClientRect().top;
      if (sectionTop !== undefined && sectionTop <= top && sectionTop > currentTop) {
        current = id;
        currentTop = sectionTop;
      }
    }
    setActiveId(current);
  }, [ids]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    // A compacted page whose content now fits has no scroll left to report, so an upward
    // wheel at the top is what expands the header there.
    const expandOnWheelUp = (e: WheelEvent) => {
      if (e.deltaY < 0 && body.scrollTop === 0) setCompact(false);
    };
    update();
    body.addEventListener('scroll', update, { passive: true });
    body.addEventListener('wheel', expandOnWheelUp, { passive: true });
    return () => {
      body.removeEventListener('scroll', update);
      body.removeEventListener('wheel', expandOnWheelUp);
    };
  }, [update]);

  const jumpTo = useCallback((id: string) => {
    const body = bodyRef.current;
    if (!body) return;
    sectionEl(body, id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  }, []);

  return { bodyRef, activeId, compact, jumpTo };
};

export { useScrollSpy };
