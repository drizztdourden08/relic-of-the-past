/* @layer renderer-components @kind hook */
/**
 * The lattice's selection, and the one drag in the editor.
 *
 * A CLICK WRITES NOTHING. That is the bug this amendment was opened for: §48
 * let a plain click on a cell commit an armed placement, so picking a cell to
 * insert a column beside it MOVED a child instead. There is no commit here any
 * more (no `commitAt`, no `commitSpan`, no `originAt`), and a click, a
 * `{mod}`-click, a `Shift`-click and a drag across cells all leave the document
 * byte-identical. What a press changes is which rows the toolbar offers and
 * which rectangle the stage echoes.
 *
 * THE DRAG SELECTS, IT NEVER MOVES. Nothing is written while the pointer travels
 * and nothing is written when it is released; the release only ends the
 * rectangle.
 *
 * EVERY MODIFIER GOES THROUGH `isPrimaryModifier` (§43.6), never a literal
 * `ctrlKey`, so `Cmd` works on a Mac and the legend beneath cannot disagree with
 * the key that actually does it.
 *
 * `Escape` REGISTERS ON THE DISMISS STACK AT `popover` (§33), so it clears the
 * selection and leaves the editor's own layer standing behind it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';
import { isPrimaryModifier } from '@shared/platform';
import { usePlatform } from '@app/platform';
import { cellKey, rectCells } from '../../GridLattice';
import { nextIndexRun } from '../../../behavior/index-selection';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { CellRef, GridSelection, TrackAxis } from '../GridEditor.type';

const useGridSelection = (containerId: string) => {
  const os = usePlatform().info.os;
  const [selection, setSelection] = useState<GridSelection>({ kind: 'none' });
  const [cursor, setCursor] = useState<CellRef>({ column: 1, row: 1 });
  const [refusal, setRefusal] = useState<string | null>(null);
  const dragFrom = useRef<CellRef | null>(null);

  useEffect(() => {
    setSelection({ kind: 'none' });
    setRefusal(null);
  }, [containerId]);

  const select = useCallback((next: GridSelection): void => {
    setRefusal(null);
    setSelection(next);
  }, []);

  const clear = useCallback(() => {
    dragFrom.current = null;
    select({ kind: 'none' });
  }, [select]);

  useDismissable({ active: selection.kind !== 'none', level: 'popover', onDismiss: clear });

  const cellsDown = useCallback((cell: CellRef, event: ReactPointerEvent): void => {
    setCursor(cell);
    dragFrom.current = cell;
    setSelection((current) => {
      if (event.shiftKey && current.kind === 'cells') {
        return { kind: 'cells', cells: rectCells(current.anchor, cell), anchor: current.anchor };
      }
      if (isPrimaryModifier(event, os) && current.kind === 'cells') {
        const has = current.cells.some((c) => cellKey(c) === cellKey(cell));
        const cells = has
          ? current.cells.filter((c) => cellKey(c) !== cellKey(cell))
          : [...current.cells, cell];
        return cells.length > 0 ? { kind: 'cells', cells, anchor: cell } : { kind: 'none' };
      }
      return { kind: 'cells', cells: [cell], anchor: cell };
    });
    setRefusal(null);
  }, [os]);

  const cellsEnter = useCallback((cell: CellRef): void => {
    const from = dragFrom.current;
    if (!from) return;
    setCursor(cell);
    setSelection({ kind: 'cells', cells: rectCells(from, cell), anchor: from });
  }, []);

  /** The release ends the rectangle and does nothing else, because there is no
   *  commit left for a pointer to claim. */
  const endDrag = useCallback((): void => { dragFrom.current = null; }, []);

  // THE PICK RULE IS SHARED WITH THE FLEX EDITOR'S CELLS (§58). A strip of
  // numbered things answers a press the same way wherever it is drawn, so
  // `behavior/index-selection.ts` owns it and neither copy can drift.
  const selectTrack = useCallback((axis: TrackAxis, index: number, event: ReactPointerEvent): void => {
    dragFrom.current = null;
    setSelection((current) => {
      const held = current.kind === 'track' && current.axis === axis ? current : null;
      const next = nextIndexRun(held, index, event, os);
      return next ? { kind: 'track', axis, ...next } : { kind: 'none' };
    });
    setRefusal(null);
  }, [os]);

  return {
    os, selection, cursor, refusal, select, clear, setCursor,
    refuse: setRefusal, cellsDown, cellsEnter, endDrag, selectTrack,
  };
};

export { useGridSelection };
