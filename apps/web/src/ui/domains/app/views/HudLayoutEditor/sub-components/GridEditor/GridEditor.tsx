/* @layer renderer-components @kind component */
/**
 * SECTION THREE IS THE GRID COMPONENT, AND NOTHING ELSE (§55). The maintainer:
 * "then another section like that with the grid component ONLY."
 *
 * SO THIS FILE HAS NO SETTINGS LEFT IN IT AND NO BOX AROUND IT. §54's
 * `GridSettings` panel (engine, guide, tracks, gap, items alignment) is
 * sections one and two now, `.hud-grid`'s own border and `--c-surface` card are
 * deleted, and so is the old `THIS CONTAINER'S COLUMNS AND ROWS` grid heading box:
 * the section's gold rule says what this is. What is left is three bands that
 * are all the same subject, the lattice:
 *
 * - `SelectionToolbar` holds actions on the SELECTION, and only those. Sticky, one
 *   row. Shared with the flex manipulation section since §58.
 * - `GridLattice` is the drawing, and since §55 the tracks' own controls too.
 * - `SelectionLegend` shows what is selected and what can be pressed right now.
 *
 * THE TRACK CONTROLS MOVED ONTO THE DRAWING, which is what finally fits the
 * strip in one row at the 232px rail. "the add column or row should be at the
 * very end of the grid component (next to the column selection last column on
 * its right) and same for row but on the bottom of that row selection last. just
 * a + icon", so the two `+`s are the lattice's own last header cells, beside
 * the strip they extend, and §54's `TRACKS` row is gone. The selected track's
 * SIZE went the same way: the header already prints `auto`/`fill`, so the
 * selected header's label IS the menu button, and the 81px `[size ▾]` field that
 * forced the toolbar onto two rows at 232 is gone from it.
 *
 * A PRESS STILL WRITES NOTHING (§50, unchanged and pinned). Clicking,
 * `{mod}`-clicking, `Shift`-clicking and dragging across cells all leave the
 * document byte-identical; what they choose is the context the toolbar and the
 * stage echo read. There is no child manipulation here at all. A child's own
 * cell is set in its own Placement section, by `CellPicker`.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { useGridSolve } from '../../behavior/grid-solve';
import { GridLattice, occupantsOf, rowCountFor } from '../GridLattice';
import { contextualActions, gridActions } from './behavior/grid-actions';
import { cellStateOf, selectionBounds } from './behavior/grid-cell-state';
import { handleGridKey } from './behavior/grid-keys';
import { chipOf, statusOf } from './behavior/grid-status';
import { useGridSelection } from './behavior/use-grid-selection';
import { applyTrackEdit, trackExtentOf } from './behavior/grid-track-actions';
import { SelectionLegend, SelectionToolbar } from '../SelectionBands';
import './HudLayoutEditor.grid.css';
import type { KeyboardEvent } from 'react';
import type { HudGridContainer } from '@shared/types/hud';
import type { CellRef, GridActionContext, TrackAxis } from './GridEditor.type';

interface GridEditorProps {
  container: HudGridContainer;
  /** The ONLY door out of this control, and it names the container alone. */
  onPatchContainer: (patch: Partial<HudGridContainer>) => void;
}

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
export type { GridEditorProps };
