/* @layer renderer-components @kind hook */
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { CellRef } from '../../GridLattice';
import { spanPlace } from './span-place';
import type { UseCellPickParams } from './useCellPick.type';

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

export { useCellPick };
