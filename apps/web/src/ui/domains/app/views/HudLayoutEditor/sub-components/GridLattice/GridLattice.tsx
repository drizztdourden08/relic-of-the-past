/* @layer renderer-components @kind component */
/**
 * THE DRAWING, and since §55 the track controls that stand on it. Two
 * controls mount this and they mean opposite things (`GridEditor` edits the
 * GRID, `CellPicker` edits one CHILD's cell), so neither owns it: it takes what
 * a cell looks like and what a press means as props, and writes nothing itself.
 * A mount that passes no `onAddTrack`/`onSizeTrack` gets a pure drawing, which
 * is exactly what `CellPicker` needs.
 *
 * `+` IS THE LAST HEADER, ON BOTH STRIPS (§55). "the add column or row should be
 * at the very end of the grid component (next to the column selection last
 * column on its right) and same for row but on the bottom of that row selection
 * last. just a + icon." So the template grows one 22px column and one 22px row
 * for them, and §54's `TRACKS` row (`3 columns [+]  3 rows [+]`, 47px of panel
 * naming a count nobody was reading) is deleted. A `+` beside the strip it
 * extends says where the new track lands without a word.
 *
 * THE CELLS MATCH THE REAL TRACKS (§50). Column widths and row heights are the
 * engine's own solve, entered as `fr` weights under a `minmax(24px, ...)` floor,
 * over a body whose height is definite (`latticeHeight`) so the row weights have
 * something to divide. Past the point where every track can still clear 24px the
 * body overflows and SCROLLS, with both header strips `position: sticky` as
 * frozen panes, because the strips are the only thing that identifies a cell.
 *
 * OCCUPANCY IS DRAWN, NEVER TOUCHED. A child's label sits over the cells it
 * covers with `pointer-events: none`, so the author can see what a track edit
 * will move but cannot edit the child from here, which is the confusion §50
 * exists to end.
 *
 * ONE TAB STOP. The body is the focusable thing and the cursor is
 * `aria-activedescendant`; a `<Button>` per cell would make a 6x4 grid 24 tab
 * stops on the way to the fields below it. The two `+`s and a selected track's
 * size button are real buttons and are the exception. They are four stops in
 * total, and each is a thing a keyboard has no other route to.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { trackText } from '../../behavior/track-extents';
import { AddTrackButton } from './sub-components/AddTrackButton';
import { TrackHead } from './sub-components/TrackHead';
import {
  ADD, GUTTER, HEAD, emptyOn, latticeHeight, occupantsAt, trackTemplate,
} from './lattice-geometry';
import './HudLayoutEditor.lattice.css';
import type { CSSProperties } from 'react';
import type { GridLatticeProps } from './GridLattice.type';

const idOf = (column: number, row: number): string => `hud-lattice-cell-${column}-${row}`;

const series = (count: number): number[] => Array.from({ length: count }, (_unused, i) => i + 1);

/** An empty `auto` track is drawn at the floor, and the note says so instead of
 *  letting 24px pass for a size the track does not have. */
const headTitle = (kind: string, index: number, text: string, empty: boolean): string =>
  `${kind} ${index} is ${text}${empty ? ' (empty, drawn at the 24px minimum)' : ''}`;

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

export { GridLattice, idOf };
