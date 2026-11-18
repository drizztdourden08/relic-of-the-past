/* @layer renderer-components @kind component */
import { Box, Shortcut, Text } from '@drizztdourden08/tessera/primitives';
import { usePlatform } from '@drizztdourden08/brock-react';
import { useGridSolve } from '@app/hud-layout-editing/grid-solve';
import { GridLattice, covers, occupantsOf, rowCountFor } from '../GridLattice';
import { shortcutPropsOf } from '../SelectionLegend';
import { useCellPick } from './behavior/useCellPick';
import { CELL_STEP, cellPickKeys } from './CellPicker.constants';
import './CellPicker.css';
import type { KeyboardEvent } from 'react';
import type { CellRef, LatticeCellState } from '../GridLattice';
import type { CellPickerProps } from './CellPicker.type';
import { useT } from '@drizztdourden08/brock-react';

const CellPicker = (props: CellPickerProps) => {
  const t = useT();
  const { container, childId, place, onChange } = props;
  const solve = useGridSolve(container);
  const occupants = occupantsOf(container, childId);
  const rows = rowCountFor(container, occupants);
  const mine = occupants.find((o) => o.id === childId);
  const pick = useCellPick({ place, onChange });
  const os = usePlatform().info.os;

  const cellState = (cell: CellRef): LatticeCellState => {
    const isMine = mine !== undefined && covers(mine, cell.column, cell.row);
    const taken = occupants.some((o) => o.id !== childId && covers(o, cell.column, cell.row));
    if (isMine) return taken ? 'occupied-selected' : 'selected';
    return taken ? 'occupied' : 'empty';
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const move = CELL_STEP[event.key];
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
      <Text className="hud-cellpick__title">{t('hud-editor:cell-picker.title', { childId })}</Text>
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
        label={t('hud-editor:cell-picker.label', { childId, columns: container.columns.length, rows })}
        onCellDown={pick.cellsDown}
        onCellEnter={pick.cellsEnter}
        onPointerUp={pick.endDrag}
        onKeyDown={onKeyDown}
      />
      <Box className="hud-cellpick__legend">
        {cellPickKeys(t).map((entry) => (
          <Box key={entry.key} className="hud-grid__key">
            <Shortcut size="xs" {...shortcutPropsOf(entry.shortcut, os)} />
            <Text className="hud-grid__key-text">{entry.label}</Text>
          </Box>
        ))}
      </Box>
      <Text className="hud-editor__hint">
        This edits {childId} only. The parent&apos;s columns and rows are edited in its own Layout section.
      </Text>
    </Box>
  );
};

export { CellPicker };
