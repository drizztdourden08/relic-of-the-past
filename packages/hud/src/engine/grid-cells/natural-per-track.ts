/* @layer shared-hud @kind logic */
import { outerSize } from '../measure';
import type { HudNode } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { GridCell } from './grid-cells.type';

const naturalPerTrack = (
  count: number, cells: Map<HudNode, GridCell>, axis: 'column' | 'row', ctx: MeasureContext,
): number[] => {
  const sizes = new Array(count).fill(0) as number[];
  cells.forEach((cell, node) => {
    const spanSizeOf = axis === 'column' ? cell.colSpan : cell.rowSpan;
    if (spanSizeOf !== 1) return;
    const index = (axis === 'column' ? cell.column : cell.row) - 1;
    if (index < 0 || index >= count) return;
    const natural = outerSize(node, ctx);
    sizes[index] = Math.max(sizes[index], axis === 'column' ? natural.w : natural.h);
  });
  return sizes;
};

export { naturalPerTrack };
