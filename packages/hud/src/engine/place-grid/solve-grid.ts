/* @layer shared-hud @kind logic */
import {
  assignCells, inOrder, naturalPerTrack, offsetsOf, rowCountOf, sizeTracks, tracksOf,
} from '../grid-cells';
import { insetsOf } from '../flow';
import { resolveGap, resolveVisible } from '../resolve-box';
import type { HudGridContainer } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Rect } from '../../layouts/geometry.type';

const solveGrid = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext) => {
  const pad = insetsOf(container.padding);
  const area: Rect = {
    x: box.x + pad.left * unit,
    y: box.y + pad.top * unit,
    w: Math.max(0, box.w - (pad.left + pad.right) * unit),
    h: Math.max(0, box.h - (pad.top + pad.bottom) * unit),
  };
  const visible = inOrder(container.children).filter((child) => resolveVisible(child, ctx));
  const cells = assignCells(visible, Math.max(1, container.columns.length));
  const { columns, rows: rowTracks } = tracksOf(container, rowCountOf(cells.values()));
  const gap = resolveGap(container, ctx);
  const colNatural = naturalPerTrack(columns.length, cells, 'column', ctx);
  const rowNatural = naturalPerTrack(rowTracks.length, cells, 'row', ctx);
  const colSizes = sizeTracks({ tracks: columns, natural: colNatural, available: area.w / unit, gap: gap.x }, ctx);
  const rowSizes = sizeTracks({ tracks: rowTracks, natural: rowNatural, available: area.h / unit, gap: gap.y }, ctx);
  return {
    area, visible, cells, gap, colSizes, rowSizes,
    colOffsets: offsetsOf(colSizes, gap.x),
    rowOffsets: offsetsOf(rowSizes, gap.y),
  };
};

export { solveGrid };
