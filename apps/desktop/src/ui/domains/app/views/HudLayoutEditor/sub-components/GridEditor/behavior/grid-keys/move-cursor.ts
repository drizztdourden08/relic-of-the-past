/* @layer renderer-components @kind logic */
import { isPrimaryModifier } from '@shared/platform/is-primary-modifier';
import { rectCells } from '../../../GridLattice';
import { ARROWS } from './grid-keys.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { CellRef, GridKeyParams } from '../../GridEditor.type';

const clamp = (value: number, max: number): number => Math.min(Math.max(value, 1), Math.max(1, max));

const moveCursor = (params: GridKeyParams, event: ReactKeyboardEvent): boolean => {
  const arrow = ARROWS[event.key];
  if (!arrow) return false;
  const { cursor, columns, rows, selection, select, setCursor } = params;
  const jump = isPrimaryModifier(event, params.os);
  const next: CellRef = {
    column: jump && arrow.dx !== 0 ? (arrow.dx < 0 ? 1 : columns) : clamp(cursor.column + arrow.dx, columns),
    row: jump && arrow.dy !== 0 ? (arrow.dy < 0 ? 1 : rows) : clamp(cursor.row + arrow.dy, rows),
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
