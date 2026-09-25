/* @layer renderer-components @kind hook */
/**
 * THE CHILD'S OWN GESTURE, and the only place in the panel where clicking a cell
 * writes anything.
 *
 * A PLAIN PRESS SETS `place`; `Shift`-PRESS OR A DRAG SETS THE SPAN. The split
 * is the same one the maintainer made in "click a cell sets `place`,
 * Shift-click or drag sets the span", and it is safe to make a press write here
 * for the reason it was NOT safe in the grid editor: this control's whole
 * subject is one child, it is mounted under that child's own Placement heading,
 * and there is nothing else in it a press could be about.
 *
 * MOVING IS MOVING: a plain placement clears the spans. §42.8 recorded the old
 * behaviour as awkward, since a centred band moved by a click needed its spans
 * cleared by hand. With a drag rectangle available, keeping them has no job
 * left. The rectangle is how you say "move AND resize".
 *
 * A DRAG COMMITS EXACTLY ONCE, ON RELEASE. Nothing is written while the pointer
 * travels, which is `useDragGesture`'s discipline (§43) applied to a gesture
 * that needs none of its drop resolution.
 */
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { HudPlace } from '@shared/types/hud';
import type { CellRef } from '../../GridLattice';

interface UseCellPickParams {
  /** The child's own `place` as the document has it. */
  place: HudPlace | undefined;
  onChange: (next: HudPlace) => void;
}

const spanPlace = (a: CellRef, b: CellRef): HudPlace => {
  const column = Math.min(a.column, b.column);
  const row = Math.min(a.row, b.row);
  const colSpan = Math.abs(a.column - b.column) + 1;
  const rowSpan = Math.abs(a.row - b.row) + 1;
  return {
    column,
    row,
    ...(colSpan > 1 ? { colSpan } : {}),
    ...(rowSpan > 1 ? { rowSpan } : {}),
  };
};

const useCellPick = (params: UseCellPickParams) => {
  const { place, onChange } = params;
  const [cursor, setCursor] = useState<CellRef>({ column: place?.column ?? 1, row: place?.row ?? 1 });
  const dragFrom = useRef<CellRef | null>(null);
  const dragged = useRef(false);

  const cellsDown = useCallback((cell: CellRef, event: ReactPointerEvent): void => {
    setCursor(cell);
    dragFrom.current = cell;
    dragged.current = false;
    if (event.shiftKey) {
      onChange(spanPlace({ column: place?.column ?? cell.column, row: place?.row ?? cell.row }, cell));
      return;
    }
    onChange({ column: cell.column, row: cell.row });
  }, [onChange, place?.column, place?.row]);

  // Travel only MOVES THE CURSOR. The span is written once, on release, from the
  // two corners the gesture actually touched.
  const cellsEnter = useCallback((cell: CellRef): void => {
    if (!dragFrom.current) return;
    dragged.current = true;
    setCursor(cell);
  }, []);

  const endDrag = useCallback((): void => {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (!from || !dragged.current) return;
    dragged.current = false;
    onChange(spanPlace(from, cursor));
  }, [cursor, onChange]);

  return { cursor, setCursor, cellsDown, cellsEnter, endDrag };
};

export { spanPlace, useCellPick };
export type { UseCellPickParams };
