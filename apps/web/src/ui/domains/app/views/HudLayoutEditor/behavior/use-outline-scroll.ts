/* @layer renderer-components @kind hook */
/**
 * Scrolls the outline to the selected row ONLY when the selection did
 * not originate from a click inside the outline itself. `onSelect` is one
 * shared callback (the stage, the inspector's jump-to-node button and the
 * outline's own rows all call it), so "did this come from outside" is read by
 * comparing against the last id the outline's OWN rows selected
 * (`markSelf`) instead of threading an origin flag through every call site.
 * Scrolling the list under the cursor when the user just clicked a row IN it
 * is exactly the jumpiness this feature usually ships with.
 *
 * EXPANDING COLLAPSED ANCESTORS happens regardless of where the selection
 * came from, because a row hidden under a folded ancestor has to exist before it can
 * be scrolled to, and there is no harm in a no-op expand when the row was
 * already visible (the outline can only select a row that IS rendered, so a
 * self-originated selection never has anything to expand).
 */
import { useEffect, useRef } from 'react';
import { ancestorIdsOf } from './tree-context';
import type { RefObject } from 'react';
import type { HudLayout } from '@shared/types/hud';

interface UseOutlineScrollInput {
  doc: HudLayout;
  selectedId: string | null;
  /** One entry per rendered row, keyed by node id. The row's own ref callback fills it in. */
  rowElements: RefObject<Map<string, HTMLElement>>;
  expandNodeIds: (ids: readonly string[]) => void;
}

interface OutlineScroll {
  /** Call from a row's own click handler, before the shared `onSelect` fires.
   *  It marks this id as self-selected so the effect below does not scroll to it. */
  markSelf: (id: string) => void;
}

const useOutlineScroll = (input: UseOutlineScrollInput): OutlineScroll => {
  const {
    doc, selectedId, rowElements, expandNodeIds,
  } = input;
  const lastSelf = useRef<string | null>(null);
  /** The last id this effect actually processed. It is distinct from `lastSelf`, so
   *  an unrelated re-render (new `doc` identity, nothing to do with selection)
   *  cannot re-trigger the scroll for a selection that never changed. */
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === lastHandled.current) return;
    lastHandled.current = selectedId;
    const fromOutline = selectedId === lastSelf.current;
    const ancestors = ancestorIdsOf(doc, selectedId);
    if (ancestors.length > 0) expandNodeIds(ancestors);
    if (fromOutline) return;
    // The expand above lands next render; wait a frame for the now-visible row
    // to actually exist before asking it to scroll itself into view.
    const raf = requestAnimationFrame(() => {
      rowElements.current?.get(selectedId)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(raf);
  }, [doc, expandNodeIds, rowElements, selectedId]);

  return { markSelf: (id: string) => { lastSelf.current = id; } };
};

export { useOutlineScroll };
export type { OutlineScroll, UseOutlineScrollInput };
