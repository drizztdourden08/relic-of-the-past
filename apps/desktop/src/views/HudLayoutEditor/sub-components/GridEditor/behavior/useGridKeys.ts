/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { cellStateOf } from './cell-state-of';
import { handleGridKey } from './handle-grid-key';
import { isTrackOn } from './is-track-on';
import type { KeyboardEvent } from 'react';
import type { CellRef, GridKeysInput, TrackAxis } from '../GridEditor.type';

const useGridKeys = (input: GridKeysInput) => {
  const { grid, occupants, columns, rows, actions } = input;

  const cellState = useCallback(
    (cell: CellRef) => cellStateOf(grid.selection, occupants, cell),
    [grid.selection, occupants],
  );
  const trackOn = useCallback(
    (axis: TrackAxis, index: number) => isTrackOn(grid.selection, axis, index),
    [grid.selection],
  );

  const onKeyDown = (event: KeyboardEvent): void => {
    const handled = handleGridKey(event, {
      os: grid.os,
      selection: grid.selection,
      cursor: grid.cursor,
      columns,
      rows,
      actions,
      select: grid.select,
      setCursor: grid.setCursor,
    });
    if (handled) event.preventDefault();
  };

  return { cellState, trackOn, onKeyDown };
};

export { useGridKeys };
