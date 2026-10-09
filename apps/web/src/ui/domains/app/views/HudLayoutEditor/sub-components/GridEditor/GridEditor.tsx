/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { useGridSolve } from '../../behavior/grid-solve';
import { GridLattice, occupantsOf, rowCountFor } from '../GridLattice';
import { contextualActions, gridActions } from './behavior/grid-actions';
import { cellStateOf, selectionBounds } from './behavior/grid-cell-state';
import { handleGridKey } from './behavior/grid-keys';
import { chipOf, statusOf } from './behavior/grid-status';
import { useGridSelection } from './behavior/useGridSelection';
import { applyTrackEdit, trackExtentOf } from './behavior/grid-track-actions';
import { SelectionLegend, SelectionToolbar } from '../SelectionBands';
import './HudLayoutEditor.grid.css';
import type { KeyboardEvent } from 'react';
import type { CellRef, GridActionContext, GridEditorProps, TrackAxis } from './GridEditor.type';

const GridEditor = (props: GridEditorProps) => {
  const { container, onPatchContainer } = props;
  const setGridEcho = useHudEditorViewStore((s) => s.setGridEcho);
  const solve = useGridSolve(container);
  const occupants = useMemo(() => occupantsOf(container), [container]);
  const rows = rowCountFor(container, occupants);
  const grid = useGridSelection(container.id);

  const ctx: GridActionContext = {
    container,
    selection: grid.selection,
    cursor: grid.cursor,
    occupants,
    rows,
    edits: { patchContainer: onPatchContainer, setSelection: grid.select, refuse: grid.refuse },
  };
  const actions = gridActions(ctx);

  const echo = useMemo(
    () => selectionBounds(grid.selection, container.columns.length, rows),
    [container.columns.length, grid.selection, rows],
  );
  useEffect(() => {
    setGridEcho(echo ? { containerId: container.id, ...echo } : null);
    return () => setGridEcho(null);
  }, [container.id, echo, setGridEcho]);

  const cellState = useCallback(
    (cell: CellRef) => cellStateOf(grid.selection, occupants, cell),
    [grid.selection, occupants],
  );
  const trackOn = useCallback(
    (axis: TrackAxis, index: number) => grid.selection.kind === 'track'
      && grid.selection.axis === axis && grid.selection.indices.includes(index),
    [grid.selection],
  );

  const onKeyDown = (event: KeyboardEvent): void => {
    const handled = handleGridKey(event, {
      os: grid.os,
      selection: grid.selection,
      cursor: grid.cursor,
      columns: container.columns.length,
      rows,
      actions,
      select: grid.select,
      setCursor: grid.setCursor,
    });
    if (handled) event.preventDefault();
  };

  return (
    <Box className="hud-grid">
      <SelectionToolbar chip={chipOf(grid.selection)} actions={contextualActions(ctx)} />
      <GridLattice
        columns={container.columns}
        rows={container.rows}
        rowCount={rows}
        colSizes={solve.columns}
        rowSizes={solve.rows}
        occupants={occupants}
        cellState={cellState}
        trackOn={trackOn}
        cursor={grid.cursor}
        label={`${container.columns.length} by ${rows} grid. Selecting a cell edits nothing`}
        onCellDown={grid.cellsDown}
        onCellEnter={grid.cellsEnter}
        onPointerUp={grid.endDrag}
        onTrackDown={grid.selectTrack}
        onAddTrack={(axis) => applyTrackEdit(container, onPatchContainer, { op: 'append', axis })}
        onSizeTrack={(axis, index, extent) => {
          const indices = trackOn(axis, index) && grid.selection.kind === 'track'
            ? grid.selection.indices : [index];
          applyTrackEdit(container, onPatchContainer, { op: 'size', axis, indices, extent });
        }}
        extentOf={(axis, index) => trackExtentOf(container, axis, index)}
        onCornerDown={() => grid.select({
          kind: 'cells',
          cells: Array.from({ length: container.columns.length * rows }, (_unused, i) => ({
            column: (i % container.columns.length) + 1,
            row: Math.floor(i / container.columns.length) + 1,
          })),
          anchor: { column: 1, row: 1 },
        })}
        onKeyDown={onKeyDown}
      />
      <SelectionLegend
        actions={actions}
        os={grid.os}
        status={statusOf({ selection: grid.selection, occupants, columns: container.columns.length, rows })}
        refusal={grid.refusal}
      />
    </Box>
  );
};

export { GridEditor };
export type { GridEditorProps } from './GridEditor.type';
