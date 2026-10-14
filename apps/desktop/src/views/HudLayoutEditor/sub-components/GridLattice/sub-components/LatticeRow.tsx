/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { trackText } from '@app/hud-layout-editing/track-extents';
import { idOf } from '../behavior/cell-id';
import { emptyOn } from '../behavior/empty-on';
import { headTitle } from '../behavior/head-title';
import { occupantsAt } from '../behavior/occupants-at';
import { series } from '../behavior/series';
import { TrackHead } from './TrackHead';
import type { LatticeRowProps } from './LatticeRow.type';

const LatticeRow = (props: LatticeRowProps) => {
  const {
    row, columns, rows, rowSizes, occupants, cellState, trackOn, cursor,
    extentOf, onTrackDown, onSizeTrack, onCellDown, onCellEnter,
  } = props;
  const track = rows?.[row - 1] ?? 'auto';
  const empty = emptyOn(rowSizes, row - 1);

  return (
    <Box className="hud-lattice__line" role="row">
      <TrackHead
        axis="rows"
        index={row - 1}
        text={String(row)}
        extent={extentOf?.('rows', row - 1)}
        selected={trackOn('rows', row - 1)}
        empty={empty}
        title={headTitle('row', row, trackText(track), empty)}
        onPointerDown={onTrackDown ? (event) => onTrackDown('rows', row - 1, event) : undefined}
        onSize={onSizeTrack ? (extent) => onSizeTrack('rows', row - 1, extent) : undefined}
      />
      {series(columns.length).map((column) => {
        const cell = { column, row };
        const state = cellState(cell);
        const here = occupantsAt(occupants, column, row).map((o) => o.id);
        return (
          <Box
            key={column}
            id={idOf(column, row)}
            className="hud-lattice__cell"
            role="gridcell"
            data-state={state}
            data-column={column}
            data-row={row}
            data-cursor={cursor.column === column && cursor.row === row ? 'true' : undefined}
            aria-selected={state === 'selected' || state === 'occupied-selected'}
            aria-label={here.length > 0
              ? `column ${column}, row ${row} with ${here.join(', ')}`
              : `column ${column}, row ${row}, empty`}
            style={{ gridColumn: column + 1, gridRow: row + 1 }}
            onPointerDown={(event) => onCellDown(cell, event)}
            onPointerEnter={() => onCellEnter(cell)}
          />
        );
      })}
    </Box>
  );
};

export { LatticeRow };
