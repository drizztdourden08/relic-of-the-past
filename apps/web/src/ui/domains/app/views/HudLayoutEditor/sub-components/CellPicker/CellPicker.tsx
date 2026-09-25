/* @layer renderer-components @kind component */
/**
 * THE CHILD'S OWN CELL PICKER. It is the same lattice as `GridEditor`, with the
 * opposite meaning.
 *
 * SINCE THE GRID EDITOR NO LONGER TOUCHES CHILDREN (§50), a grid child needs its
 * placement control back, and this is it. It shows the PARENT's grid with its tracks,
 * proportions and everybody else's occupancy, and writes exactly one thing, this
 * child's own `place`. Click a cell to set it; `Shift`-click or drag a rectangle
 * to set the span. There is NO track editing here at all: no header selects, no
 * insert, no remove, no toolbar. The parent's template is the parent's Layout
 * section's business.
 *
 * THE HEADING SAYS WHICH IS WHICH, on purpose. The two controls look alike
 * by design, being one grid drawn one way, so each one states in its
 * own header what it writes, which is the cheapest guard against the exact
 * confusion the maintainer warned about.
 */
import { Box } from '@ds/primitives/Box';
import { KeyCap } from '@ds/primitives/KeyCap';
import { MouseGlyph } from '@ds/primitives/MouseGlyph';
import { Text } from '@ds/primitives/Text';
import { useGridSolve } from '../../behavior/grid-solve';
import { GridLattice, covers, occupantsOf, rowCountFor } from '../GridLattice';
import { useCellPick } from './behavior/use-cell-pick';
import './HudLayoutEditor.cellpick.css';
import type { KeyboardEvent } from 'react';
import type { HudGridContainer, HudPlace } from '@shared/types/hud';
import type { CellRef, LatticeCellState } from '../GridLattice';

interface CellPickerProps {
  /** The PARENT. Shown whole, never changed. */
  container: HudGridContainer;
  childId: string;
  place: HudPlace | undefined;
  onChange: (next: HudPlace) => void;
}

const CellPicker = (props: CellPickerProps) => {
  const { container, childId, place, onChange } = props;
  const solve = useGridSolve(container);
  const occupants = occupantsOf(container);
  const rows = rowCountFor(container, occupants);
  const mine = occupants.find((o) => o.id === childId);
  const pick = useCellPick({ place, onChange });

  // "Selected" here means THIS child stands on it. The picker's subject is the
  // child, so the selection and the child's footprint are the same rectangle.
  const cellState = (cell: CellRef): LatticeCellState => {
    const isMine = !!mine && covers(mine, cell.column, cell.row);
    const taken = occupants.some((o) => o.id !== childId && covers(o, cell.column, cell.row));
    if (isMine) return taken ? 'occupied-selected' : 'selected';
    return taken ? 'occupied' : 'empty';
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const step: Record<string, CellRef> = {
      ArrowLeft: { column: -1, row: 0 }, ArrowRight: { column: 1, row: 0 },
      ArrowUp: { column: 0, row: -1 }, ArrowDown: { column: 0, row: 1 },
    };
    const move = step[event.key];
    if (!move) return;
    event.preventDefault();
    const next = {
      column: Math.min(Math.max(pick.cursor.column + move.column, 1), container.columns.length),
      row: Math.min(Math.max(pick.cursor.row + move.row, 1), rows),
    };
    pick.setCursor(next);
    onChange({ column: next.column, row: next.row });
  };

  return (
    <Box className="hud-cellpick">
      <Text className="hud-cellpick__title">{`The cell where ${childId} sits in its parent's grid`}</Text>
      <GridLattice
        columns={container.columns}
        rows={container.rows}
        rowCount={rows}
        colSizes={solve.columns}
        rowSizes={solve.rows}
        occupants={occupants}
        activeChildId={childId}
        cellState={cellState}
        trackOn={() => false}
        cursor={pick.cursor}
        label={`Pick a cell for ${childId} in the ${container.columns.length} by ${rows} parent grid`}
        onCellDown={pick.cellsDown}
        onCellEnter={pick.cellsEnter}
        onPointerUp={pick.endDrag}
        onKeyDown={onKeyDown}
      />
      <Box className="hud-cellpick__legend">
        <Box className="hud-grid__key">
          <MouseGlyph part="left" />
          <Text className="hud-grid__key-text">set the cell</Text>
        </Box>
        <Box className="hud-grid__key">
          <KeyCap label="⇧" />
          <MouseGlyph part="left" />
          <Text className="hud-grid__key-text">span to here</Text>
        </Box>
        <Box className="hud-grid__key">
          <MouseGlyph part="drag" />
          <Text className="hud-grid__key-text">span a rectangle</Text>
        </Box>
      </Box>
      <Text className="hud-editor__hint">
        This edits {childId} only. The parent&apos;s columns and rows are edited in its own Layout section.
      </Text>
    </Box>
  );
};

export { CellPicker };
export type { CellPickerProps };
