/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { COMPACT_AFTER, CURRENT_SLACK } from './useScrollSpy.constants';

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
