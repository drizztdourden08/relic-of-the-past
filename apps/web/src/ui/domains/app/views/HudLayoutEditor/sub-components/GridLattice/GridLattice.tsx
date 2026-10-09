/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { trackText } from '../../behavior/track-extents';
import { AddTrackButton } from './sub-components/AddTrackButton';
import { TrackHead } from './sub-components/TrackHead';
import {
  ADD, GUTTER, HEAD, emptyOn, latticeHeight, occupantsAt, trackTemplate,
} from './lattice-geometry';
import { idOf } from './behavior/cell-id';
import { headTitle } from './behavior/head-title';
import './HudLayoutEditor.lattice.css';
import type { CSSProperties } from 'react';
import type { GridLatticeProps } from './GridLattice.type';

const series = (count: number): number[] => Array.from({ length: count }, (_unused, i) => i + 1);

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
        <Box className="hud-lattice__line" role="row">
          <Box
            className="hud-lattice__corner"
            role="columnheader"
            aria-label={onCornerDown ? 'Select every cell' : 'Grid'}
            data-inert={onCornerDown ? undefined : 'true'}
            onPointerDown={onCornerDown}
          />
          {columns.map((track, index) => (
            <TrackHead
              key={index}
              axis="columns"
              index={index}
              text={trackText(track)}
              extent={extentOf?.('columns', index)}
              selected={trackOn('columns', index)}
              empty={emptyOn(colSizes, index)}
              title={headTitle('column', index + 1, trackText(track), emptyOn(colSizes, index))}
              onPointerDown={onTrackDown ? (event) => onTrackDown('columns', index, event) : undefined}
              onSize={onSizeTrack ? (extent) => onSizeTrack('columns', index, extent) : undefined}
            />
          ))}
          {onAddTrack && (
            <AddTrackButton axis="columns" at={columns.length + 2} onAdd={() => onAddTrack('columns')} />
          )}
        </Box>

        {series(rowCount).map((row) => {
          const track = rows?.[row - 1] ?? 'auto';
          const empty = emptyOn(rowSizes, row - 1);
          return (
            <Box key={row} className="hud-lattice__line" role="row">
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
        })}

        {onAddTrack && (
          <AddTrackButton axis="rows" at={rowCount + 2} onAdd={() => onAddTrack('rows')} />
        )}

        {occupants.map((occupant) => (
          <Text
            key={occupant.id}
            className="hud-lattice__occupant"
            aria-hidden="true"
            data-active={occupant.id === activeChildId ? 'true' : undefined}
            style={{
              gridColumn: `${occupant.column + 1} / span ${occupant.colSpan}`,
              gridRow: `${occupant.row + 1} / span ${occupant.rowSpan}`,
            }}
          >
            {occupant.id}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export { GridLattice };
