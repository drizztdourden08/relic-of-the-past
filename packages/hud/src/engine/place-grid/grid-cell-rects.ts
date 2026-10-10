/* @layer shared-hud @kind logic */
import { solveGrid } from './solve-grid';
import type { HudGridContainer } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';
import type { GridCellRect } from './place-grid.type';

const gridCellRects = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext): GridCellRect[] => {
  const { area, gap, colSizes, rowSizes, colOffsets, rowOffsets } = solveGrid(container, box, unit, ctx);
  const columns = colSizes.map((cw, ci) => ({ column: ci + 1, x: area.x + (colOffsets[ci] ?? 0) * unit, w: cw * unit }));
  const rowCells = (row: number, y: number, h: number): GridCellRect[] => columns.map(({ column, x, w }) => ({
    column,
    row,
    implicit: row > rowSizes.length,
    rect: { x, y, w, h },
  }));
  const out = rowSizes.flatMap((rh, ri) => rowCells(ri + 1, area.y + (rowOffsets[ri] ?? Number.NaN) * unit, rh * unit));
  const usedH = (rowOffsets.at(-1) ?? 0) + (rowSizes.at(-1) ?? 0) + gap.y;
  const leftover = area.h / unit - usedH;
  if (leftover <= 0) return out;
  return [...out, ...rowCells(rowSizes.length + 1, area.y + usedH * unit, leftover * unit)];
};

export { gridCellRects };
