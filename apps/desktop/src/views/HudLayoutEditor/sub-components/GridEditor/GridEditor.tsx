/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useGridSolve } from '@app/hud-layout-editing/grid-solve';
import { GridLattice, occupantsOf, rowCountFor } from '../GridLattice';
import { contextualActions } from './behavior/contextual-actions';
import { gridActions } from './behavior/grid-actions';
import { allCellsSelection } from './behavior/all-cells-selection';
import { chipOf } from './behavior/chip-of';
import { sizeIndices } from './behavior/size-indices';
import { statusOf } from './behavior/status-of';
import { useGridEcho } from './behavior/useGridEcho';
import { useGridKeys } from './behavior/useGridKeys';
import { useGridSelection } from './behavior/useGridSelection';
import { applyTrackEdit } from './behavior/apply-track-edit';
import { trackExtentOf } from './behavior/track-extent-of';
import { SelectionLegend } from '../SelectionLegend';
import { SelectionToolbar } from '../SelectionToolbar';
import './GridEditor.css';
import type { GridActionContext, GridEditorProps } from './GridEditor.type';

const GridEditor = (props: GridEditorProps) => {
  const { container, onPatchContainer } = props;
  const solve = useGridSolve(container);
  const occupants = useMemo(() => occupantsOf(container), [container]);
  const rows = rowCountFor(container, occupants);
  const columns = container.columns.length;
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
  useGridEcho(container.id, grid.selection, columns, rows);

  const { cellState, trackOn, onKeyDown } = useGridKeys({ grid, occupants, columns, rows, actions });

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
        label={`${columns} by ${rows} grid. Selecting a cell edits nothing`}
        onCellDown={grid.cellsDown}
        onCellEnter={grid.cellsEnter}
        onPointerUp={grid.endDrag}
        onTrackDown={grid.selectTrack}
        onAddTrack={(axis) => applyTrackEdit(container, onPatchContainer, { op: 'append', axis })}
        onSizeTrack={(axis, index, extent) => applyTrackEdit(
          container, onPatchContainer, { op: 'size', axis, indices: sizeIndices(grid.selection, axis, index), extent },
        )}
        extentOf={(axis, index) => trackExtentOf(container, axis, index)}
        onCornerDown={() => grid.select(allCellsSelection(columns, rows))}
        onKeyDown={onKeyDown}
      />
      <SelectionLegend
        actions={actions}
        os={grid.os}
        status={statusOf({ selection: grid.selection, occupants, columns, rows })}
        refusal={grid.refusal}
      />
    </Box>
  );
};

export { GridEditor };
