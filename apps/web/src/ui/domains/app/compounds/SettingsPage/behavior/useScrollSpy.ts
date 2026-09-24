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

const sectionEl = (body: HTMLElement, id: string): HTMLElement | null =>
  body.querySelector<HTMLElement>(`[data-section="${id}"]`);

const useScrollSpy = (ids: readonly string[]) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  const [compact, setCompact] = useState(false);

  const update = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    setCompact(body.scrollTop > COMPACT_AFTER);
    const top = body.getBoundingClientRect().top + CURRENT_SLACK;
    let current = ids[0] ?? '';
    for (const id of ids) {
      const el = sectionEl(body, id);
      if (el && el.getBoundingClientRect().top <= top) current = id;
    }
    setActiveId(current);
  }, [ids]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    update();
    body.addEventListener('scroll', update, { passive: true });
    return () => body.removeEventListener('scroll', update);
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
