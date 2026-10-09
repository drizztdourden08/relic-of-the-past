/* @layer renderer-components @kind logic */
import { gridCellRects } from '@rotp/hud';
import { scaledRect } from './scaled-rect';
import type { GridCellRect } from '@rotp/hud';
import type { MeasureContext, PlacedNode } from '@rotp/hud';
import type { HudGridContainer } from '@rotp/hud';

const stageCellRects = (host: PlacedNode, displayScale: number, ctx: MeasureContext): GridCellRect[] =>
  gridCellRects(host.node as HudGridContainer, host.rect, host.scale, ctx).map((cell) => ({
    ...cell,
    rect: scaledRect(cell.rect, displayScale),
  }));

export { stageCellRects };
