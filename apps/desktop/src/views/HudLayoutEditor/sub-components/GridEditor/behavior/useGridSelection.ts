/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import { isPrimaryModifier } from '@rotp/input-mapping';
import { usePlatform } from '@drizztdourden08/brock-react';
import { cellKey, rectCells } from '../../GridLattice';
import { nextIndexRun } from '@app/hud-layout-editing/index-selection';
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

  useEscapeStack({ active: selection.kind !== 'none', level: 'popover', onEscape: clear });

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

  const endDrag = useCallback((): void => { dragFrom.current = null; }, []);

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
