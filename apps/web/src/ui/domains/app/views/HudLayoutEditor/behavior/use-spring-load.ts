/* @layer renderer-components @kind hook */
/**
 * HOVERING A COLLAPSED ROW OPENS IT, after 500 ms, like Finder's and Explorer's
 * spring-load, at the low end of the 500-600 ms range those ship.
 *
 * THE MECHANISM ALREADY EXISTED. Collapse state is `collapsedNodeIds` in the
 * editor's view store (§30: folding a row shut is a fact about how someone is
 * looking at a tree, not about the HUD the tree describes), and
 * `use-outline-scroll.ts` already calls `expandNodeIds` for the neighbouring
 * reason that "a row hidden under a folded ancestor has to exist before it can be
 * scrolled to". This is that same call, on a timer, from a drag.
 *
 * IT IS FOR AIMING PAST A ROW, NOT FOR REACHING IT. A collapsed row is already a
 * perfectly good drop target while folded: `inside` means append, which needs no
 * visible children. What spring-load buys is the row's DESCENDANTS, for dropping
 * between two grandchildren of something that is shut.
 *
 * THE DECISION THE PLAN LEFT OPEN, AND THE ANSWER (§45): A SPRING-OPENED ROW
 * RE-COLLAPSES ON DROP UNLESS THE DROP LANDED IN IT. Both halves are load
 * bearing. Re-collapsing is the default because a drag that leaves six folders
 * open behind it has damaged the view to do a move, and the author
 * never asked for any of them. The outline they come back to should be the
 * outline they left. The exception is the row the node actually went into,
 * because folding THAT shut would hide the thing that was just moved, which
 * reads as the drop having failed. A cancel keeps neither: nothing landed, so
 * every spring goes back.
 *
 * THE TIMER RESETS ON LEAVING THE ROW, and the caret shows the wait instead of
 * snapping. `pending` drives that, and it is the only animation in this
 * whole design. It earns its place because it is the only way to tell "waiting"
 * from "nothing is going to happen".
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { ancestorIdsOf } from './tree-context';
import type { HudLayout } from '@shared/types/hud';

/** The dwell before a hovered collapsed row opens. */
const SPRING_MS = 500;

interface SpringLoadInput {
  doc: HudLayout;
  /** Live only while a drag is. Going false is what settles every spring. */
  active: boolean;
  /** The row the pointer is over right now, or null. */
  rowId: string | null;
}

interface SpringLoad {
  /** The row currently counting down, for the caret's own progress. */
  pending: string | null;
  /** Called from the drag's commit with the container the drop landed in, so
   *  that one row (and its ancestors) survives the re-collapse. Null, or never
   *  called at all, means nothing landed. */
  landed: (parentId: string | null) => void;
}

const useSpringLoad = (input: SpringLoadInput): SpringLoad => {
  const { doc, active, rowId } = input;
  const collapsedNodeIds = useHudEditorViewStore((s) => s.collapsedNodeIds);
  const expandNodeIds = useHudEditorViewStore((s) => s.expandNodeIds);
  const collapseNodeIds = useHudEditorViewStore((s) => s.collapseNodeIds);
  const [pending, setPending] = useState<string | null>(null);
  /** Every row this drag opened, in the order it opened them. */
  const sprung = useRef<string[]>([]);
  const where = useRef<string | null>(null);
  const state = useRef({ doc, collapsedNodeIds, expandNodeIds, collapseNodeIds });
  state.current = { doc, collapsedNodeIds, expandNodeIds, collapseNodeIds };

  const waiting = active && rowId !== null && collapsedNodeIds.has(rowId) ? rowId : null;

  useEffect(() => {
    setPending(waiting);
    if (waiting === null) return undefined;
    const timer = setTimeout(() => {
      sprung.current = [...sprung.current, waiting];
      setPending(null);
      state.current.expandNodeIds([waiting]);
    }, SPRING_MS);
    return () => clearTimeout(timer);
  }, [waiting]);

  useEffect(() => {
    if (active) return;
    const opened = sprung.current;
    sprung.current = [];
    const landing = where.current;
    where.current = null;
    if (opened.length === 0) return;
    const keep = new Set(landing ? [landing, ...ancestorIdsOf(state.current.doc, landing)] : []);
    const back = opened.filter((id) => !keep.has(id));
    if (back.length > 0) state.current.collapseNodeIds(back);
  }, [active]);

  const landed = useCallback((parentId: string | null) => { where.current = parentId; }, []);

  return { pending, landed };
};

export { SPRING_MS, useSpringLoad };
export type { SpringLoad, SpringLoadInput };
