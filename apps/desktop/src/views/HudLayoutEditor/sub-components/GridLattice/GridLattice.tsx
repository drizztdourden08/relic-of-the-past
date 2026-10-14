/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { AddTrackButton } from './sub-components/AddTrackButton';
import { LatticeHeader } from './sub-components/LatticeHeader';
import { LatticeOccupants } from './sub-components/LatticeOccupants';
import { LatticeRow } from './sub-components/LatticeRow';
import { ADD, GUTTER, HEAD } from './behavior/lattice-geometry.constants';
import { latticeHeight } from './behavior/lattice-height';
import { series } from './behavior/series';
import { trackTemplate } from './behavior/track-template';
import { idOf } from './behavior/cell-id';
import './GridLattice.css';
import type { CSSProperties } from 'react';
import type { GridLatticeProps } from './GridLattice.type';

const GridLattice = (props: GridLatticeProps) => {
  const {
    columns, rows, rowCount, colSizes, rowSizes, occupants, activeChildId,
    cellState, trackOn, cursor, label,
    onCellDown, onCellEnter, onPointerUp, onKeyDown, onTrackDown, onCornerDown,
    onAddTrack, onSizeTrack, extentOf,
  } = props;
  const tail = onAddTrack ? ADD : 0;
  const style = {
    gridTemplateColumns: `${trackTemplate(colSizes, columns.length, GUTTER)}${tail ? ` ${tail}px` : ''}`,
    gridTemplateRows: `${trackTemplate(rowSizes, rowCount, HEAD)}${tail ? ` ${tail}px` : ''}`,
    height: latticeHeight(rowCount) + tail,
  } as CSSProperties;

  return (
    <Box className="hud-lattice__scroll" onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <Box
        className="hud-lattice__body"
        role="grid"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={idOf(cursor.column, cursor.row)}
        style={style}
        onKeyDown={onKeyDown}
      >
        <LatticeHeader
          columns={columns}
          colSizes={colSizes}
          trackOn={trackOn}
          onCornerDown={onCornerDown}
          onTrackDown={onTrackDown}
          onSizeTrack={onSizeTrack}
          onAddTrack={onAddTrack}
          extentOf={extentOf}
        />

        {series(rowCount).map((row) => (
          <LatticeRow
            key={row}
            row={row}
            columns={columns}
            rows={rows}
            rowSizes={rowSizes}
            occupants={occupants}
            cellState={cellState}
            trackOn={trackOn}
            cursor={cursor}
            extentOf={extentOf}
            onTrackDown={onTrackDown}
            onSizeTrack={onSizeTrack}
            onCellDown={onCellDown}
            onCellEnter={onCellEnter}
          />
        ))}

        {onAddTrack && (
          <AddTrackButton axis="rows" at={rowCount + 2} onAdd={() => onAddTrack('rows')} />
        )}

        <LatticeOccupants occupants={occupants} activeChildId={activeChildId} />
      </Box>
    </Box>
  );
};

export { GridLattice };
