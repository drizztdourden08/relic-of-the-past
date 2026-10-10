/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import { ancestorIdsOf } from './tree-context';
import type { OutlineScroll, UseOutlineScrollInput } from './outline-scroll.type';

const useOutlineScroll = (input: UseOutlineScrollInput): OutlineScroll => {
  const {
    doc, selectedId, rowElements, expandNodeIds,
  } = input;
  const lastSelf = useRef<string | null>(null);
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === lastHandled.current) return;
    lastHandled.current = selectedId;
    const fromOutline = selectedId === lastSelf.current;
    const ancestors = ancestorIdsOf(doc, selectedId);
    if (ancestors.length > 0) expandNodeIds(ancestors);
    if (fromOutline) return;
    const raf = requestAnimationFrame(() => {
      rowElements.current?.get(selectedId)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(raf);
  }, [doc, expandNodeIds, rowElements, selectedId]);

  return { markSelf: (id: string) => { lastSelf.current = id; } };
};

export { useOutlineScroll };
export type { OutlineScroll, UseOutlineScrollInput } from './outline-scroll.type';
