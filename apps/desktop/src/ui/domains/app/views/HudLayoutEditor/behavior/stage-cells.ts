/* @layer renderer-components @kind logic */
import { gridCellRects } from '@shared/hud/engine/place-grid';
import { scaledRect } from './scaled-rect';
import type { GridCellRect } from '@shared/hud/engine/place-grid';
import type { MeasureContext, PlacedNode } from '@shared/hud/engine';
import type { HudGridContainer } from '@shared/types/hud';

const stageCellRects = (host: PlacedNode, displayScale: number, ctx: MeasureContext): GridCellRect[] =>
  gridCellRects(host.node as HudGridContainer, host.rect, host.scale, ctx).map((cell) => ({
    ...cell,
    rect: scaledRect(cell.rect, displayScale),
  }));

export { stageCellRects };
