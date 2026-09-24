/* @layer renderer-components @kind logic */
/**
 * A widget's own OS window being dragged over the app, seen as the same drag
 * source a title bar press makes. The existing view builder then draws the
 * drop hints and the existing resolver picks the drop, unchanged.
 */
import type { WidgetId } from '@shared/types/widget-layout';
import type { DragContext, DragSource, DragView, Point } from './drag-types';
import { FLOAT_BOX, resolveDrop, viewFor } from './drag-resolve';
import type { DropResult } from './drag-resolve';

/** Where the OS drag is, in the stage's coordinates. */
interface ExternalDrag {
  id: WidgetId;
  pointer: Point;
}

/** The pointer's offset inside the box the widget lands as, the same grab a title bar gives. */
const GRAB = { x: 24, y: 15 } as const;

const externalSource = (id: WidgetId, pointer: Point, size: { width: number; height: number }): DragSource => ({
  id, isGame: false, fromKey: null, fromTab: false, floating: null, loneWidget: false,
  start: pointer, grab: GRAB, size,
});

const externalView = (ctx: DragContext, drag: ExternalDrag, size?: { width: number; height: number }): DragView => {
  const source = externalSource(drag.id, drag.pointer, size ?? FLOAT_BOX);
  const client = { x: drag.pointer.x + ctx.stage.x, y: drag.pointer.y + ctx.stage.y };
  const view = viewFor(ctx, source, { pointer: drag.pointer, client, onScreen: client }, { shift: false, ctrl: false });
  // Coming from outside, past the edge means nothing: the window is already out.
  return { ...view, outside: false, stays: false };
};

const externalDrop = (ctx: DragContext, drag: ExternalDrag, size?: { width: number; height: number }): DropResult => {
  const source = externalSource(drag.id, drag.pointer, size ?? FLOAT_BOX);
  return resolveDrop(source, externalView(ctx, drag, size));
};

export { externalDrop, externalView };
export type { ExternalDrag };
