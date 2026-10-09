/* @layer shared-hud @kind logic */
import { solveGrid } from './solve-grid';
import type { HudGridContainer } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';
import type { GridCellRect } from './place-grid.type';

const gridCellRects = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext): GridCellRect[] => {
  const { area, gap, colSizes, rowSizes, colOffsets, rowOffsets } = solveGrid(container, box, unit, ctx);
  const cellAt = (ci: number, row: number, y: number, h: number): GridCellRect => ({
    column: ci + 1,
    row,
    implicit: row > rowSizes.length,
    rect: { x: area.x + (colOffsets[ci] ?? 0) * unit, y, w: colSizes[ci] * unit, h },
  });
  const out = rowSizes.flatMap((rh, ri) =>
    colSizes.map((_, ci) => cellAt(ci, ri + 1, area.y + rowOffsets[ri] * unit, rh * unit)));
  const usedH = (rowOffsets.at(-1) ?? 0) + (rowSizes.at(-1) ?? 0) + gap.y;
  const leftover = area.h / unit - usedH;
  if (leftover <= 0) return out;
  return [...out, ...colSizes.map((_, ci) => cellAt(ci, rowSizes.length + 1, area.y + usedH * unit, leftover * unit))];
};

export { gridCellRects };
