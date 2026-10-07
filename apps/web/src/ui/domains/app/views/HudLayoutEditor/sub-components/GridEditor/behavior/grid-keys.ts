/* @layer renderer-components @kind logic */
/**
 * THE KEYBOARD LOOKS ITS ACTION UP BY THE CAP THE LEGEND DRAWS. Since §58
 * that lookup is `behavior/action-keys.ts`, shared with the flex editor, which
 * reads exactly the same kind of table. What is left here belongs to the
 * lattice alone: cursor motion over TWO axes, which the legend groups
 * as one `←→↑↓` row instead of four, and which writes nothing.
 */
import { isPrimaryModifier } from '@shared/platform';
import { capOf, runnerFor } from '../../../behavior/action-keys';
import { rectCells } from '../../GridLattice';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { OsKind } from '@shared/platform';
import type { CellRef, GridAction, GridSelection } from '../GridEditor.type';

const ARROWS: Readonly<Record<string, { glyph: string; dx: number; dy: number }>> = {
  ArrowLeft: { glyph: '←', dx: -1, dy: 0 },
  ArrowRight: { glyph: '→', dx: 1, dy: 0 },
  ArrowUp: { glyph: '↑', dx: 0, dy: -1 },
  ArrowDown: { glyph: '↓', dx: 0, dy: 1 },
};

interface GridKeyParams {
  os: OsKind;
  selection: GridSelection;
  cursor: CellRef;
  columns: number;
  rows: number;
  actions: readonly GridAction[];
  select: (next: GridSelection) => void;
  setCursor: (cell: CellRef) => void;
}

/** Kept as this module's own name over the shared `capOf` it now delegates to,
 *  because six call sites and two tests read it. */
const labelOf = capOf;

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

const handleGridKey = (event: ReactKeyboardEvent, params: GridKeyParams): boolean => {
  const label = labelOf(event);
  if (label === null) return false;
  const match = runnerFor(params.actions, label);
  if (match?.run) {
    match.run();
    return true;
  }
  return moveCursor(params, event);
};

export { handleGridKey, labelOf, runnerFor };
export type { GridKeyParams };
