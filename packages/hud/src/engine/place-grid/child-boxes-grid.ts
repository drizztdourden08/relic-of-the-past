/* @layer shared-hud @kind logic */
import { spanSize } from '../grid-cells';
import { insetsOf } from '../flow';
import { measureBox } from '../measure';
import { resolveExtent } from '../resolve-extent';
import { clampToBox } from '../resolve-box';
import { solveGrid } from './solve-grid';
import type { HudGridContainer, HudGridJustifyItems, HudNode } from '../../types/hud-node';
import type { ChildBox } from '../place-flow.type';
import type { MeasureContext } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';

const placeInCell = (
  node: HudNode, cellW: number, cellH: number, ctx: MeasureContext,
  justifyItems: HudGridJustifyItems, alignItems: HudGridJustifyItems,
): { w: number; h: number; x: number; y: number } => {
  const margin = insetsOf(node.margin);
  const innerW = Math.max(0, cellW - margin.left - margin.right);
  const innerH = Math.max(0, cellH - margin.top - margin.bottom);
  const natural = measureBox(node, ctx);
  const justify = node.justifySelf ?? node.alignSelf ?? justifyItems;
  const align = node.alignSelf ?? alignItems;
  const wExtent = node.size?.w ?? (justify === 'stretch' ? 'fill' : 'auto');
  const hExtent = node.size?.h ?? (align === 'stretch' ? 'fill' : 'auto');
  const rawW = resolveExtent(wExtent, natural.w, innerW, ctx);
  const rawH = resolveExtent(hExtent, natural.h, innerH, ctx);
  const w = clampToBox(node, 'w', rawW === 'fill' ? innerW : rawW, ctx);
  const h = clampToBox(node, 'h', rawH === 'fill' ? innerH : rawH, ctx);
  const freeW = innerW - w;
  const freeH = innerH - h;
  const x = margin.left + (justify === 'center' ? freeW / 2 : justify === 'end' ? freeW : 0);
  const y = margin.top + (align === 'center' ? freeH / 2 : align === 'end' ? freeH : 0);
  return { w, h, x, y };
};

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
    const placed = placeInCell(node, cellW, cellH, ctx, justifyItems, alignItems);
    if (placed.w <= 0 || placed.h <= 0) return [];
    return [{
      node,
      box: { x: cellX + placed.x * unit, y: cellY + placed.y * unit, w: placed.w * unit, h: placed.h * unit },
    }];
  });
};

export { childBoxesGrid };
