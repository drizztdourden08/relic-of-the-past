/* @layer shared-hud @kind logic */
import { spanSize } from '../grid-cells';
import { placeInCell } from './place-in-cell';
import { solveGrid } from './solve-grid';
import type { HudGridContainer } from '../../types/hud-node';
import type { ChildBox } from '../place-flow.type';
import type { MeasureContext } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';

const childBoxesGrid = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext): ChildBox[] => {
  const { area, visible, cells, gap, colSizes, rowSizes, colOffsets, rowOffsets } = solveGrid(container, box, unit, ctx);
  const justifyItems = container.justifyItems ?? 'stretch';
  const alignItems = container.alignItems ?? 'stretch';

  return visible.flatMap((node) => {
    const cell = cells.get(node);
    if (!cell) return [];
    const colIndex = cell.column - 1;
    const rowIndex = cell.row - 1;
    const cellW = spanSize(colSizes, colIndex, cell.colSpan, gap.x);
    const cellH = spanSize(rowSizes, rowIndex, cell.rowSpan, gap.y);
    const cellX = area.x + (colOffsets[colIndex] ?? 0) * unit;
    const cellY = area.y + (rowOffsets[rowIndex] ?? 0) * unit;
    const placed = placeInCell(node, { w: cellW, h: cellH }, ctx, { justify: justifyItems, align: alignItems });
    if (placed.w <= 0 || placed.h <= 0) return [];
    return [{
      node,
      box: { x: cellX + placed.x * unit, y: cellY + placed.y * unit, w: placed.w * unit, h: placed.h * unit },
    }];
  });
};

export { childBoxesGrid };
