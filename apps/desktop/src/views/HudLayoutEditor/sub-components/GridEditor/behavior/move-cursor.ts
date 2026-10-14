/* @layer renderer-components @kind logic */
import { isPrimaryModifier } from '@rotp/input-mapping';
import { rectCells } from '../../GridLattice';
import { ARROWS } from './grid-keys.constants';
import { stepAxis } from './step-axis';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { CellRef, GridKeyParams } from '../GridEditor.type';

const moveCursor = (params: GridKeyParams, event: ReactKeyboardEvent): boolean => {
  const arrow = ARROWS[event.key];
  if (!arrow) return false;
  const { cursor, columns, rows, selection, select, setCursor } = params;
  const jump = isPrimaryModifier(event, params.os);
  const next: CellRef = {
    column: stepAxis(cursor.column, arrow.dx, jump, columns),
    row: stepAxis(cursor.row, arrow.dy, jump, rows),
  };
  setCursor(next);
  if (selection.kind === 'cells' && event.shiftKey) {
    select({ kind: 'cells', cells: rectCells(selection.anchor, next), anchor: selection.anchor });
    return true;
  }
  if (selection.kind === 'track') return true;
  select({ kind: 'cells', cells: [next], anchor: next });
  return true;
};

export { moveCursor };
