/* @layer shared-hud @kind logic */
import { assignCells, inOrder, naturalPerTrack, rowCountOf, sizeTracks, tracksOf } from '../grid-cells';
import { resolveGap, resolveVisible } from '../resolve-box';
import type { HudGridContainer } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const gridContentSize = (container: HudGridContainer, ctx: MeasureContext): Size => {
  const visible = inOrder(container.children).filter((child) => resolveVisible(child, ctx));
  const cells = assignCells(visible, Math.max(1, container.columns.length));
  const rows = rowCountOf(cells.values());
  const { columns, rows: rowTracks } = tracksOf(container, rows);
  const gap = resolveGap(container, ctx);
  const colNatural = naturalPerTrack(columns.length, cells, 'column', ctx);
  const rowNatural = naturalPerTrack(rowTracks.length, cells, 'row', ctx);
  const colSizes = sizeTracks({ tracks: columns, natural: colNatural, available: Infinity, gap: gap.x }, ctx);
  const rowSizes = sizeTracks({ tracks: rowTracks, natural: rowNatural, available: Infinity, gap: gap.y }, ctx);
  const w = colSizes.reduce((sum, v) => sum + v, 0) + gap.x * Math.max(0, colSizes.length - 1);
  const h = rowSizes.reduce((sum, v) => sum + v, 0) + gap.y * Math.max(0, rowSizes.length - 1);
  return { w, h };
};

export { gridContentSize };
