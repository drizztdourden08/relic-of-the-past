/* @layer shared-hud @kind logic */
import { inOrder } from './in-order';
import type { HudNode } from '../../types/hud-node';
import type { GridCell } from './grid-cells.type';

const span = (node: HudNode, key: 'colSpan' | 'rowSpan'): number => Math.max(1, node.place?.[key] ?? 1);

const assignCells = (children: readonly HudNode[], columns: number): Map<HudNode, GridCell> => {
  const cells = new Map<HudNode, GridCell>();
  const occupied = new Set<string>();
  const key = (c: number, r: number): string => `${c},${r}`;
  const mark = (cell: GridCell): void => {
    for (let r = cell.row; r < cell.row + cell.rowSpan; r += 1) {
      for (let c = cell.column; c < cell.column + cell.colSpan; c += 1) occupied.add(key(c, r));
    }
  };
  const ordered = inOrder(children);

  ordered.forEach((node) => {
    const place = node.place;
    if (place?.column === undefined || place.row === undefined) return;
    const cell: GridCell = {
      column: place.column, row: place.row, colSpan: span(node, 'colSpan'), rowSpan: span(node, 'rowSpan'),
    };
    cells.set(node, cell);
    mark(cell);
  });

  let cursorRow = 1;
  let cursorCol = 1;
  const fits = (col: number, row: number, colSpan: number, rowSpan: number): boolean => {
    if (col + colSpan - 1 > columns) return false;
    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) if (occupied.has(key(c, r))) return false;
    }
    return true;
  };

  ordered.forEach((node) => {
    if (cells.has(node)) return;
    const colSpan = span(node, 'colSpan');
    const rowSpan = span(node, 'rowSpan');
    for (;;) {
      if (cursorCol + colSpan - 1 > columns) { cursorCol = 1; cursorRow += 1; }
      if (fits(cursorCol, cursorRow, colSpan, rowSpan)) break;
      cursorCol += 1;
    }
    const cell: GridCell = { column: cursorCol, row: cursorRow, colSpan, rowSpan };
    cells.set(node, cell);
    mark(cell);
    cursorCol += colSpan;
  });

  return cells;
};

export { assignCells };
